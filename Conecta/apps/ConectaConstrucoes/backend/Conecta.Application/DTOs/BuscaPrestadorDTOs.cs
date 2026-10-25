namespace Conecta.Application.DTOs;

public record FiltroBuscaPrestadorRequest(
    string? Categoria = null,
    string? Termo = null,
    decimal? Lat = null,
    decimal? Lng = null,
    int RaioKm = 15,
    bool ApenasDisponiveis = false,
    string? Ordenacao = "distancia",
    int Pagina = 1,
    int TamanhoPagina = 20
);

public record PrestadorBuscaItemResponse(
    int Id,
    int UsuarioId,
    string Nome,
    string? NomeFantasia,
    string Avatar,
    string? CapaUrl,
    string Profissao,
    string Categoria,
    decimal Avaliacao,
    int NumAvaliacoes,
    bool DestaqueRegiao,
    string TipoBadge,
    string BadgeTexto,
    double DistanciaKm,
    string DistanciaTexto,
    decimal PrecoHora,
    string PrecoTexto,
    string PrecoLabel,
    string StatusDisponibilidade,
    List<string> Tags,
    bool TemChat = true
);

public record PrestadorBuscaPaginadaResponse(
    IEnumerable<PrestadorBuscaItemResponse> Itens,
    int TotalItens,
    int Pagina,
    int TamanhoPagina,
    int TotalPaginas
);
