using System.ComponentModel.DataAnnotations;

namespace Conecta.Application.DTOs;

public record ItemPropostaRequest(
    [Required] string Descricao,
    [Range(0.01, 1000000)] decimal Valor,
    [Range(1, 1000)] int Quantidade = 1
);

public record ItemPropostaResponse(
    int Id,
    string Descricao,
    decimal Valor,
    int Quantidade
);

public record EnviarPropostaRequest(
    [Required]
    [Range(0.01, 1000000, ErrorMessage = "O valor total deve ser positivo.")]
    decimal ValorTotal,

    int? PrazoDias,
    string? Descricao,
    List<ItemPropostaRequest>? Itens
);

public record PropostaResponse(
    int Id,
    int SolicitacaoId,
    int PrestadorId,
    decimal ValorTotal,
    int? PrazoDias,
    string? Descricao,
    string Status,
    DateTime CriadoEm,
    List<ItemPropostaResponse> Itens
);
