using System.ComponentModel.DataAnnotations;

namespace Conecta.Application.DTOs;

public record CriarPermissaoRequest(
    [Required(ErrorMessage = "O nome da permissão é obrigatório.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "O nome deve ter entre 2 e 100 caracteres.")]
    string Nome,

    string? Descricao = null,

    [StringLength(50, ErrorMessage = "O recurso deve ter no máximo 50 caracteres.")]
    string? Recurso = null,

    [StringLength(50, ErrorMessage = "A ação deve ter no máximo 50 caracteres.")]
    string? Acao = null
);

public record PermissaoResponse(
    int Id,
    string Nome,
    string? Descricao,
    string? Recurso,
    string? Acao,
    DateTime CriadoEm
);
