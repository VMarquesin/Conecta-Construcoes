namespace Conecta.Application.DTOs;

public record CriarAvaliacaoRequest(
    int PedidoId,
    int Nota,
    string? Comentario
);

public record AvaliacaoResponse(
    int Id,
    int PedidoId,
    int ClienteId,
    string ClienteNome,
    int PrestadorId,
    int Nota,
    string? Comentario,
    DateTime DataCriacao
);
