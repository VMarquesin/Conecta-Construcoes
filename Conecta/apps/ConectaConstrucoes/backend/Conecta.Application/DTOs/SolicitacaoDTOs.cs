using System.ComponentModel.DataAnnotations;

namespace Conecta.Application.DTOs;

public record CriarSolicitacaoRequest(
    [Required(ErrorMessage = "O prestador é obrigatório.")]
    int PrestadorId,

    int? CategoriaId,

    [Required(ErrorMessage = "O título do serviço é obrigatório.")]
    [StringLength(255, MinimumLength = 3, ErrorMessage = "O título deve ter entre 3 e 255 caracteres.")]
    string Titulo,

    [Required(ErrorMessage = "A descrição da necessidade é obrigatória.")]
    string Descricao,

    string? EnderecoAtendimento = null,
    List<string>? Imagens = null
);

public record SolicitacaoResponse(
    int Id,
    int ClienteId,
    string ClienteNome,
    int PrestadorId,
    string PrestadorNome,
    string Titulo,
    string Descricao,
    string Status,
    string? EnderecoAtendimento,
    DateTime CriadoEm,
    List<string> Imagens
);
