using Conecta.Domain.Entidades;

namespace Conecta.Domain.Interfaces;

public record FiltroGeoespacial(
    string? CategoriaSlug = null,
    string? TermoBusca = null,
    decimal? Latitude = null,
    decimal? Longitude = null,
    int RaioKm = 15,
    bool ApenasDisponiveis = false,
    string? Ordenacao = "distancia", // "distancia", "avaliacao", "preco_asc", "preco_desc"
    int Pagina = 1,
    int TamanhoPagina = 20
);

public record PrestadorBuscaItem(
    int UsuarioId,
    string Nome,
    string? NomeFantasia,
    string? FotoPerfilUrl,
    string? CapaUrl,
    decimal Latitude,
    decimal Longitude,
    int RaioAtendimentoKm,
    string StatusDisponibilidade,
    bool SeloSuperprestador,
    bool DestaqueRegiao,
    int? TempoMedioRespostaMinutos,
    decimal MediaAvaliacao,
    int TotalAvaliacoes,
    decimal? ValorHoraInicial,
    string? Categorias,
    double DistanciaKm
);

public interface IPrestadorRepository
{
    Task<(IEnumerable<PrestadorBuscaItem> Itens, int Total)> BuscarGeoespacialAsync(FiltroGeoespacial filtro);
    Task<Prestador?> ObterPorUsuarioIdAsync(int usuarioId);
    Task AtualizarStatusDisponibilidadeAsync(int usuarioId, string status);
    Task AtualizarBioAsync(int usuarioId, string bio);
    Task<bool> AdicionarFavoritoAsync(int clienteId, int prestadorId);
    Task<bool> RemoverFavoritoAsync(int clienteId, int prestadorId);
    Task<bool> IsFavoritadoAsync(int clienteId, int prestadorId);
    Task<IEnumerable<Portfolio>> ObterPortfoliosDoPrestadorAsync(int prestadorId);
    Task<IEnumerable<Avaliacao>> ObterAvaliacoesDoPrestadorAsync(int prestadorId);
    Task<Endereco?> ObterEnderecoPrincipalAsync(int usuarioId);
    Task<decimal> ObterGanhosConcluidosAsync(int prestadorId, DateTime desde);
    Task<Portfolio> AdicionarPortfolioAsync(Portfolio portfolio);
    Task RemoverPortfolioAsync(int prestadorId, int portfolioId);
}
