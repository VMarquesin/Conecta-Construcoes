using System.ComponentModel.DataAnnotations;

namespace Conecta.Application.DTOs;

public record CriarRoleRequest(
    [Required(ErrorMessage = "O nome da role é obrigatório.")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "O nome deve ter entre 2 e 50 caracteres.")]
    string Nome,

    string? Descricao = null,
    bool Ativo = true,
    List<int>? PermissoesIds = null
);

public record AtualizarRoleRequest(
    string? Descricao,
    bool Ativo = true
);

public record RoleResponse(
    int Id,
    string Nome,
    string? Descricao,
    bool Ativo,
    DateTime CriadoEm,
    List<string> Permissoes
);

public record AssociarPermissaoRequest(
    [Required(ErrorMessage = "O ID da permissão é obrigatório.")]
    int PermissaoId
);
