using System.ComponentModel.DataAnnotations;

namespace Conecta.Application.DTOs;

public record CriarUsuarioRequest(
    [Required(ErrorMessage = "O nome é obrigatório.")]
    [StringLength(150, MinimumLength = 2, ErrorMessage = "O nome deve ter entre 2 e 150 caracteres.")]
    string Nome,

    [Required(ErrorMessage = "O e-mail é obrigatório.")]
    [EmailAddress(ErrorMessage = "Formato de e-mail inválido.")]
    string Email,

    [Required(ErrorMessage = "A senha é obrigatória.")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "A senha deve ter no mínimo 6 caracteres.")]
    string Senha,

    string Tipo = "CLIENTE",
    List<string>? RolesIniciais = null
);

public record AtualizarUsuarioRequest(
    [Required(ErrorMessage = "O nome é obrigatório.")]
    [StringLength(150, MinimumLength = 2, ErrorMessage = "O nome deve ter entre 2 e 150 caracteres.")]
    string Nome,

    [Required(ErrorMessage = "O e-mail é obrigatório.")]
    [EmailAddress(ErrorMessage = "Formato de e-mail inválido.")]
    string Email,

    string? StatusConta = null,
    string? StatusVerificacao = null
);

public record AlterarSenhaRequest(
    [Required(ErrorMessage = "A senha atual é obrigatória.")]
    string SenhaAtual,

    [Required(ErrorMessage = "A nova senha é obrigatória.")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "A nova senha deve ter no mínimo 6 caracteres.")]
    string NovaSenha
);

public record UsuarioResponse(
    int Id,
    string Nome,
    string Email,
    string Tipo,
    string StatusVerificacao,
    string StatusConta,
    DateTime? UltimoAcessoEm,
    DateTime CriadoEm,
    DateTime AtualizadoEm,
    List<string> Roles
);

public record UsuarioPaginadoResponse(
    IEnumerable<UsuarioResponse> Itens,
    int Total,
    int Pagina,
    int TamanhoPagina
);

public record AssociarRoleRequest(
    [Required(ErrorMessage = "O ID da role é obrigatório.")]
    int RoleId
);
