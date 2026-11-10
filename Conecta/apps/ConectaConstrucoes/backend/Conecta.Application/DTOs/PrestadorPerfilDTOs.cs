namespace Conecta.Application.DTOs;

public record PortfolioItemDto(
    int Id,
    string Titulo,
    string? Subtitulo,
    string Imagem
);

public record AvaliacaoItemDto(
    int Id,
    int ClienteId,
    string Nome,
    int Nota,
    string Data,
    DateTime CriadoEm,
    string Comentario,
    string Iniciais
);

public record PrestadorPerfilDetalhadoResponse(
    int Id,
    string Nome,
    string Profissao,
    string Avatar,
    string Capa,
    string Bio,
    int? ExperienciaAnos,
    decimal? ValorHora,
    int? RaioAtendimentoKm,
    string StatusDisponibilidade,
    string TempoResposta,
    decimal Avaliacao,
    int NumAvaliacoes,
    bool SeloSuper,
    bool Verificado,
    bool IsFavorited,
    bool PodeAvaliar,
    string Cidade,
    string Estado,
    List<string> Checklist,
    List<PortfolioItemDto> Portfolio,
    List<AvaliacaoItemDto> Avaliacoes
);
