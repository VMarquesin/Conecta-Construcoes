using System.Data;
using Conecta.Domain.Entidades;
using Conecta.Domain.Enums;
using Conecta.Domain.Interfaces;
using Conecta.Infrastructure.Data;
using Dapper;
using Microsoft.EntityFrameworkCore;

namespace Conecta.Infrastructure.Repositorios;

public class PrestadorRepository : IPrestadorRepository
{
    private readonly AppDbContext _context;
    private readonly IDbConnectionFactory _connectionFactory;

    public PrestadorRepository(AppDbContext context, IDbConnectionFactory connectionFactory)
    {
        _context = context;
        _connectionFactory = connectionFactory;
    }

    public async Task<(IEnumerable<PrestadorBuscaItem> Itens, int Total)> BuscarGeoespacialAsync(FiltroGeoespacial filtro)
    {
        using var connection = _connectionFactory.CreateConnection();

        var temCoordenadas = filtro.Latitude.HasValue && filtro.Longitude.HasValue;
        var lat = filtro.Latitude ?? 0;
        var lng = filtro.Longitude ?? 0;

        var sqlDistancia = temCoordenadas
            ? @"6371 * acos(
                    LEAST(1.0, GREATEST(-1.0,
                        cos(radians(@Lat)) * cos(radians(v.latitude)) *
                        cos(radians(v.longitude) - radians(@Lng)) +
                        sin(radians(@Lat)) * sin(radians(v.latitude))
                    ))
                )"
            : "0.0";

        var sqlWhere = new List<string> { "1=1" };
        var parametros = new DynamicParameters();
        parametros.Add("Lat", (double)lat);
        parametros.Add("Lng", (double)lng);
        parametros.Add("RaioKm", filtro.RaioKm);

        if (temCoordenadas && filtro.RaioKm > 0)
        {
            sqlWhere.Add($"({sqlDistancia}) <= LEAST(@RaioKm, v.raio_atendimento_km)");
        }

        if (filtro.ApenasDisponiveis)
        {
            sqlWhere.Add("v.status_disponibilidade = 'DISPONIVEL'");
        }

        if (!string.IsNullOrWhiteSpace(filtro.CategoriaSlug))
        {
            parametros.Add("CategoriaSlug", filtro.CategoriaSlug.Trim().ToLower());
            sqlWhere.Add(@"EXISTS (
                SELECT 1 FROM prestador_categorias pc 
                INNER JOIN categorias c ON pc.categoria_id = c.id 
                WHERE pc.prestador_id = v.usuario_id AND LOWER(c.slug) = @CategoriaSlug
            )");
        }

        if (!string.IsNullOrWhiteSpace(filtro.TermoBusca))
        {
            parametros.Add("Termo", $"%{filtro.TermoBusca.Trim().ToLower()}%");
            sqlWhere.Add(@"(
                LOWER(v.nome) LIKE @Termo OR 
                LOWER(COALESCE(v.nome_fantasia, '')) LIKE @Termo OR 
                LOWER(COALESCE(v.categorias, '')) LIKE @Termo
            )");
        }

        var whereClause = string.Join(" AND ", sqlWhere);

        var sqlOrderBy = filtro.Ordenacao?.ToLower() switch
        {
            "avaliacao" => "v.media_avaliacao DESC, v.total_avaliacoes DESC",
            "preco_asc" => "p.valor_hora_inicial ASC NULLS LAST",
            "preco_desc" => "p.valor_hora_inicial DESC NULLS LAST",
            _ => temCoordenadas ? "distancia_km ASC, v.media_avaliacao DESC" : "p.destaque_regiao DESC, v.media_avaliacao DESC"
        };

        var offset = (filtro.Pagina - 1) * filtro.TamanhoPagina;
        parametros.Add("Limit", filtro.TamanhoPagina);
        parametros.Add("Offset", offset);

        var countSql = $@"
            SELECT COUNT(*) 
            FROM vw_prestadores_ativos v
            INNER JOIN prestador p ON v.usuario_id = p.usuario_id
            WHERE {whereClause};";

        var querySql = $@"
            SELECT 
                v.usuario_id AS UsuarioId,
                v.nome AS Nome,
                v.nome_fantasia AS NomeFantasia,
                u.foto_perfil_url AS FotoPerfilUrl,
                v.capa_url AS CapaUrl,
                v.latitude AS Latitude,
                v.longitude AS Longitude,
                v.raio_atendimento_km AS RaioAtendimentoKm,
                v.status_disponibilidade::text AS StatusDisponibilidade,
                v.selo_superprestador AS SeloSuperprestador,
                p.destaque_regiao AS DestaqueRegiao,
                v.tempo_medio_resposta_minutos AS TempoMedioRespostaMinutos,
                v.media_avaliacao AS MediaAvaliacao,
                v.total_avaliacoes AS TotalAvaliacoes,
                p.valor_hora_inicial AS ValorHoraInicial,
                v.categorias AS Categorias,
                ROUND(({sqlDistancia})::numeric, 1) AS DistanciaKm
            FROM vw_prestadores_ativos v
            INNER JOIN prestador p ON v.usuario_id = p.usuario_id
            INNER JOIN usuarios u ON v.usuario_id = u.id
            WHERE {whereClause}
            ORDER BY {sqlOrderBy}
            LIMIT @Limit OFFSET @Offset;";

        var total = await connection.ExecuteScalarAsync<int>(countSql, parametros);
        var itens = await connection.QueryAsync<PrestadorBuscaItem>(querySql, parametros);

        return (itens, total);
    }

    public async Task<Prestador?> ObterPorUsuarioIdAsync(int usuarioId)
    {
        return await _context.Prestadores
            .Include(p => p.Usuario)
            .FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);
    }

    public async Task AtualizarStatusDisponibilidadeAsync(int usuarioId, string status)
    {
        var prestador = await _context.Prestadores.FindAsync(usuarioId);
        if (prestador != null)
        {
            if (Enum.TryParse<StatusDisponibilidade>(status, true, out var parsedStatus))
                prestador.StatusDisponibilidade = parsedStatus;
            prestador.AtualizadoEm = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    public async Task AtualizarBioAsync(int usuarioId, string bio)
    {
        var prestador = await _context.Prestadores.FindAsync(usuarioId);
        if (prestador != null)
        {
            prestador.Bio = bio;
            prestador.AtualizadoEm = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> AdicionarFavoritoAsync(int clienteId, int prestadorId)
    {
        var existe = await _context.Favoritos.AnyAsync(f => f.ClienteId == clienteId && f.PrestadorId == prestadorId);
        if (existe) return true;

        await _context.Favoritos.AddAsync(new Favorito
        {
            ClienteId = clienteId,
            PrestadorId = prestadorId,
            CriadoEm = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoverFavoritoAsync(int clienteId, int prestadorId)
    {
        var fav = await _context.Favoritos.FirstOrDefaultAsync(f => f.ClienteId == clienteId && f.PrestadorId == prestadorId);
        if (fav != null)
        {
            _context.Favoritos.Remove(fav);
            await _context.SaveChangesAsync();
            return true;
        }
        return false;
    }

    public async Task<bool> IsFavoritadoAsync(int clienteId, int prestadorId)
    {
        return await _context.Favoritos.AnyAsync(f => f.ClienteId == clienteId && f.PrestadorId == prestadorId);
    }

    public async Task<IEnumerable<Portfolio>> ObterPortfoliosDoPrestadorAsync(int prestadorId)
    {
        return await _context.Portfolios
            .Include(p => p.Imagens.OrderBy(i => i.Ordem))
            .AsNoTracking()
            .Where(p => p.PrestadorId == prestadorId)
            .OrderByDescending(p => p.Destaque)
            .ThenByDescending(p => p.CriadoEm)
            .ToListAsync();
    }

    public async Task<IEnumerable<Avaliacao>> ObterAvaliacoesDoPrestadorAsync(int prestadorId)
    {
        return await _context.Avaliacoes
            .Include(a => a.Cliente)
                .ThenInclude(c => c.Usuario)
            .AsNoTracking()
            .Where(a => a.PrestadorId == prestadorId)
            .OrderByDescending(a => a.DataCriacao)
            .ToListAsync();
    }

    public async Task<Endereco?> ObterEnderecoPrincipalAsync(int usuarioId)
    {
        return await _context.Enderecos
            .Include(e => e.Cidade)
                .ThenInclude(c => c.Estado)
            .AsNoTracking()
            .Where(e => e.UsuarioId == usuarioId)
            .OrderByDescending(e => e.Principal)
            .FirstOrDefaultAsync();
    }

    public async Task<decimal> ObterGanhosConcluidosAsync(int prestadorId, DateTime desde)
    {
        return await _context.Pedidos
            .Where(p => p.PrestadorId == prestadorId && p.Status == StatusPedido.CONCLUIDO && p.ConcluidoEm >= desde)
            .SumAsync(p => p.ValorFinal ?? p.ValorCombinado ?? 0);
    }

    public async Task<PrestadorEstatisticas?> ObterEstatisticasAsync(int prestadorId)
    {
        using var connection = _connectionFactory.CreateConnection();
        try
        {
            var sql = @"
                SELECT 
                    usuario_id AS UsuarioId,
                    nome AS Nome,
                    COALESCE(total_pedidos, 0) AS TotalPedidos,
                    COALESCE(total_avaliacoes, 0) AS TotalAvaliacoes,
                    COALESCE(media_avaliacoes, 5.0) AS MediaAvaliacoes,
                    COALESCE(total_servicos_realizados, 0) AS TotalServicosRealizados
                FROM vw_estatisticas_prestador
                WHERE usuario_id = @prestadorId";
            var resultado = await connection.QueryFirstOrDefaultAsync<PrestadorEstatisticas>(sql, new { prestadorId });
            if (resultado != null) return resultado;
        }
        catch
        {
            // Fallback se a view não estiver criada ainda
        }

        var p = await _context.Prestadores
            .Include(x => x.Usuario)
            .FirstOrDefaultAsync(x => x.UsuarioId == prestadorId);
        if (p == null) return null;

        var totalPedidos = await _context.Pedidos.CountAsync(x => x.PrestadorId == prestadorId);
        var totalAvaliacoes = p.Usuario?.TotalAvaliacoes ?? 0;
        var media = p.Usuario?.MediaAvaliacao ?? 5.0m;

        return new PrestadorEstatisticas(
            prestadorId,
            p.Usuario?.Nome ?? "Prestador",
            totalPedidos,
            totalAvaliacoes,
            media,
            totalPedidos
        );
    }

    public async Task<Portfolio> AdicionarPortfolioAsync(Portfolio portfolio)
    {
        await _context.Portfolios.AddAsync(portfolio);
        await _context.SaveChangesAsync();
        return portfolio;
    }

    public async Task RemoverPortfolioAsync(int prestadorId, int portfolioId)
    {
        var item = await _context.Portfolios.FirstOrDefaultAsync(p => p.Id == portfolioId && p.PrestadorId == prestadorId);
        if (item != null)
        {
            _context.Portfolios.Remove(item);
            await _context.SaveChangesAsync();
        }
    }
}
