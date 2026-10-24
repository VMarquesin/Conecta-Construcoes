using System.ComponentModel.DataAnnotations;

namespace Conecta.Application.DTOs;

public record LoginRequest(
    [Required(ErrorMessage = "O e-mail é obrigatório.")]
    [EmailAddress(ErrorMessage = "Formato de e-mail inválido.")]
    string Email,

    [Required(ErrorMessage = "A senha é obrigatória.")]
    string Senha
);

public record LoginResponse(
    string Token,
    DateTime Expiracao,
    UsuarioResponse Usuario,
    List<string> Permissoes
);
