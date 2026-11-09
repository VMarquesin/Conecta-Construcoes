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

public class PrestadorBuscaItem
{
    public int UsuarioId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? NomeFantasia { get; set; }
    public string? FotoPerfilUrl { get; set; }
    public string? CapaUrl { get; set; }
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public int RaioAtendimentoKm { get; set; }
    public string StatusDisponibilidade { get; set; } = string.Empty;
    public bool SeloSuperprestador { get; set; }
    public bool DestaqueRegiao { get; set; }
    public int? TempoMedioRespostaMinutos { get; set; }
    public decimal MediaAvaliacao { get; set; }
    public int TotalAvaliacoes { get; set; }
    public decimal? ValorHoraInicial { get; set; }
    public string? Categorias { get; set; }
    public decimal DistanciaKm { get; set; }

    public PrestadorBuscaItem() { }

    public PrestadorBuscaItem(
        int usuarioId,
        string nome,
        string? nomeFantasia,
        string? fotoPerfilUrl,
        string? capaUrl,
        decimal latitude,
        decimal longitude,
        int raioAtendimentoKm,
        string statusDisponibilidade,
        bool seloSuperprestador,
        bool destaqueRegiao,
        int? tempoMedioRespostaMinutos,
        decimal mediaAvaliacao,
        int totalAvaliacoes,
        decimal? valorHoraInicial,
        string? categorias,
        decimal distanciaKm)
    {
        UsuarioId = usuarioId;
        Nome = nome;
        NomeFantasia = nomeFantasia;
        FotoPerfilUrl = fotoPerfilUrl;
        CapaUrl = capaUrl;
        Latitude = latitude;
        Longitude = longitude;
        RaioAtendimentoKm = raioAtendimentoKm;
        StatusDisponibilidade = statusDisponibilidade;
        SeloSuperprestador = seloSuperprestador;
        DestaqueRegiao = destaqueRegiao;
        TempoMedioRespostaMinutos = tempoMedioRespostaMinutos;
        MediaAvaliacao = mediaAvaliacao;
        TotalAvaliacoes = totalAvaliacoes;
        ValorHoraInicial = valorHoraInicial;
        Categorias = categorias;
        DistanciaKm = distanciaKm;
    }
}

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
    Task<PrestadorEstatisticas?> ObterEstatisticasAsync(int prestadorId);
    Task<Portfolio> AdicionarPortfolioAsync(Portfolio portfolio);
    Task RemoverPortfolioAsync(int prestadorId, int portfolioId);
}

public record PrestadorEstatisticas(
    int UsuarioId,
    string Nome,
    int TotalPedidos,
    int TotalAvaliacoes,
    decimal MediaAvaliacoes,
    int TotalServicosRealizados
);
