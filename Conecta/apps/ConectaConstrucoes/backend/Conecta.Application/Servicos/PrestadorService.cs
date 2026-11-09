using Conecta.Application.DTOs;
using Conecta.Domain.Interfaces;

namespace Conecta.Application.Servicos;

public class PrestadorService : IPrestadorService
{
    private readonly IPrestadorRepository _prestadorRepository;

    public PrestadorService(IPrestadorRepository prestadorRepository)
    {
        _prestadorRepository = prestadorRepository;
    }

    public async Task<PrestadorBuscaPaginadaResponse> BuscarAsync(FiltroBuscaPrestadorRequest request)
    {
        var pagina = request.Pagina < 1 ? 1 : request.Pagina;
        var tamanhoPagina = request.TamanhoPagina < 1 || request.TamanhoPagina > 100 ? 20 : request.TamanhoPagina;

        var filtro = new FiltroGeoespacial(
            CategoriaSlug: request.Categoria,
            TermoBusca: request.Termo,
            Latitude: request.Lat,
            Longitude: request.Lng,
            RaioKm: request.RaioKm <= 0 ? 15 : request.RaioKm,
            ApenasDisponiveis: request.ApenasDisponiveis,
            Ordenacao: request.Ordenacao,
            Pagina: pagina,
            TamanhoPagina: tamanhoPagina
        );

        var (itens, total) = await _prestadorRepository.BuscarGeoespacialAsync(filtro);

        var itensFormatados = itens.Select(p =>
        {
            var tipoBadge = p.SeloSuperprestador ? "super" : "verificado";
            var badgeTexto = p.SeloSuperprestador ? "Superprestador" : "Verificado";
            var precoHora = p.ValorHoraInicial ?? 90.00m;
            var precoTexto = $"R$ {precoHora:F0}/hora";

            var distanciaTexto = request.Lat.HasValue && request.Lng.HasValue
                ? $"a {p.DistanciaKm:F1} km de você • Atende até {p.RaioAtendimentoKm} km"
                : $"Atende até {p.RaioAtendimentoKm} km";

            var tagsList = !string.IsNullOrWhiteSpace(p.Categorias)
                ? p.Categorias.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(t => t.Trim())
                    .ToList()
                : new List<string> { "Serviços Gerais" };

            var profissao = !string.IsNullOrWhiteSpace(p.NomeFantasia)
                ? p.NomeFantasia
                : (!string.IsNullOrWhiteSpace(p.Categorias) ? p.Categorias : "Prestador de Serviços");

            return new PrestadorBuscaItemResponse(
                Id: p.UsuarioId,
                UsuarioId: p.UsuarioId,
                Nome: p.Nome,
                NomeFantasia: p.NomeFantasia,
                Avatar: p.FotoPerfilUrl ?? p.CapaUrl ?? "",
                CapaUrl: p.CapaUrl,
                Profissao: profissao,
                Categoria: request.Categoria ?? (tagsList.FirstOrDefault() ?? "Geral"),
                Avaliacao: p.MediaAvaliacao,
                NumAvaliacoes: p.TotalAvaliacoes,
                DestaqueRegiao: p.DestaqueRegiao,
                TipoBadge: tipoBadge,
                BadgeTexto: badgeTexto,
                DistanciaKm: (double)p.DistanciaKm,
                DistanciaTexto: distanciaTexto,
                PrecoHora: precoHora,
                PrecoTexto: precoTexto,
                PrecoLabel: "A partir de",
                StatusDisponibilidade: p.StatusDisponibilidade,
                Tags: tagsList,
                TemChat: true
            );
        }).ToList();

        var totalPaginas = (int)Math.Ceiling((double)total / tamanhoPagina);

        return new PrestadorBuscaPaginadaResponse(
            Itens: itensFormatados,
            TotalItens: total,
            Pagina: pagina,
            TamanhoPagina: tamanhoPagina,
            TotalPaginas: totalPaginas
        );
    }

    public async Task<PrestadorPerfilDetalhadoResponse?> ObterPerfilDetalhadoAsync(int prestadorId, int? clienteIdLogado = null)
    {
        var prestador = await _prestadorRepository.ObterPorUsuarioIdAsync(prestadorId);
        if (prestador == null) return null;

        var portfolios = await _prestadorRepository.ObterPortfoliosDoPrestadorAsync(prestadorId);
        var avaliacoes = await _prestadorRepository.ObterAvaliacoesDoPrestadorAsync(prestadorId);
        var endereco = await _prestadorRepository.ObterEnderecoPrincipalAsync(prestadorId);

        var isFavorited = clienteIdLogado.HasValue &&
                          await _prestadorRepository.IsFavoritadoAsync(clienteIdLogado.Value, prestadorId);

        var portfolioDtos = portfolios.Select(p => new PortfolioItemDto(
            p.Id,
            p.Titulo ?? "Serviço Realizado",
            p.Descricao ?? "Acabamento padrão Conecta",
            p.Imagens.FirstOrDefault()?.ImagemUrl ?? ""
        )).ToList();

        var avaliacaoDtos = avaliacoes.Select(a =>
        {
            var nome = a.Cliente?.Usuario?.Nome ?? "Cliente";
            return new AvaliacaoItemDto(
                a.Id,
                nome,
                a.Nota,
                FormatarTempoRelativo(a.DataCriacao),
                a.Comentario ?? "",
                ExtrairIniciais(nome)
            );
        }).ToList();

        var checklistPadrao = new List<string>
        {
            "Atendimento no prazo",
            "Garantia Conecta Protege",
            "Orçamento detalhado",
            "Ferramentas próprias e segurança",
            "Laudo ou comprovação de conclusão",
            "Normas técnicas aplicáveis"
        };

        var tempoRespostaMinutos = prestador.TempoMedioRespostaMinutos ?? 15;
        var tempoRespostaTexto = $"Responde em média em {tempoRespostaMinutos} min";

        return new PrestadorPerfilDetalhadoResponse(
            Id: prestador.UsuarioId,
            Nome: prestador.Usuario.Nome,
            Profissao: !string.IsNullOrWhiteSpace(prestador.NomeFantasia) ? prestador.NomeFantasia : "Prestador de Serviços",
            Avatar: prestador.Usuario.FotoPerfilUrl ?? prestador.CapaUrl ?? "",
            Capa: prestador.CapaUrl ?? "",
            Bio: prestador.Bio ?? "Profissional cadastrado e verificado na plataforma Conecta Construções.",
            ExperienciaAnos: prestador.ExperienciaAnos ?? 5,
            ValorHora: prestador.ValorHoraInicial ?? 90.00m,
            StatusDisponibilidade: prestador.StatusDisponibilidade.ToString(),
            TempoResposta: tempoRespostaTexto,
            Avaliacao: prestador.Usuario.MediaAvaliacao,
            NumAvaliacoes: prestador.Usuario.TotalAvaliacoes,
            SeloSuper: prestador.SeloSuperprestador,
            Verificado: prestador.Usuario.Verificado,
            IsFavorited: isFavorited,
            Cidade: endereco?.CidadeNome ?? (endereco?.Cidade?.Nome ?? "Tupã"),
            Estado: endereco?.EstadoSigla ?? (endereco?.Cidade?.Estado?.Sigla ?? "SP"),
            Checklist: checklistPadrao,
            Portfolio: portfolioDtos,
            Avaliacoes: avaliacaoDtos
        );
    }

    public async Task<bool> AlternarFavoritoAsync(int clienteId, int prestadorId)
    {
        var jaFavorito = await _prestadorRepository.IsFavoritadoAsync(clienteId, prestadorId);
        if (jaFavorito)
        {
            await _prestadorRepository.RemoverFavoritoAsync(clienteId, prestadorId);
            return false;
        }

        await _prestadorRepository.AdicionarFavoritoAsync(clienteId, prestadorId);
        return true;
    }

    private static string ExtrairIniciais(string nome)
    {
        if (string.IsNullOrWhiteSpace(nome)) return "CO";
        var partes = nome.Trim().Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
        if (partes.Length == 1) return partes[0].Substring(0, Math.Min(2, partes[0].Length)).ToUpper();
        return $"{partes[0][0]}{partes[^1][0]}".ToUpper();
    }

    private static string FormatarTempoRelativo(DateTime data)
    {
        var span = DateTime.UtcNow - data;
        if (span.TotalDays >= 7)
        {
            var semanas = (int)(span.TotalDays / 7);
            return $"há {semanas} semana{(semanas > 1 ? "s" : "")}";
        }
        if (span.TotalDays >= 1)
        {
            var dias = (int)span.TotalDays;
            return $"há {dias} dia{(dias > 1 ? "s" : "")}";
        }
        if (span.TotalHours >= 1)
        {
            var horas = (int)span.TotalHours;
            return $"há {horas} hora{(horas > 1 ? "s" : "")}";
        }
        return "recente";
    }
}
