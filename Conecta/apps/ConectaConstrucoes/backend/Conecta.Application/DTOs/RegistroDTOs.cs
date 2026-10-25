using System.ComponentModel.DataAnnotations;

namespace Conecta.Application.DTOs;

public record EnderecoDto(
    [Required(ErrorMessage = "O CEP é obrigatório.")]
    string Cep,

    [Required(ErrorMessage = "O logradouro é obrigatório.")]
    string Logradouro,

    string Numero = "S/N",
    string? Complemento = null,
    string? Bairro = null,

    [Required(ErrorMessage = "A cidade é obrigatória.")]
    string Cidade = "",

    [Required(ErrorMessage = "O estado (UF) é obrigatório.")]
    [StringLength(2, MinimumLength = 2, ErrorMessage = "O estado deve ter 2 caracteres (UF).")]
    string Estado = "SP",

    decimal? Latitude = null,
    decimal? Longitude = null
);

public record DadosPrestadorDto(
    string? NomeFantasia = null,
    string? Bio = null,
    int? ExperienciaAnos = null,
    decimal? ValorHoraInicial = null,
    int? RaioAtendimentoKm = 15
);

public record RegistroUsuarioRequest(
    [Required(ErrorMessage = "O nome é obrigatório.")]
    [StringLength(150, MinimumLength = 2, ErrorMessage = "O nome deve ter entre 2 e 150 caracteres.")]
    string Nome,

    [Required(ErrorMessage = "O e-mail é obrigatório.")]
    [EmailAddress(ErrorMessage = "Formato de e-mail inválido.")]
    string Email,

    [Required(ErrorMessage = "A senha é obrigatória.")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "A senha deve ter no mínimo 6 caracteres.")]
    string Senha,

    [Required(ErrorMessage = "O perfil é obrigatório.")]
    string Perfil = "CLIENTE", // "CLIENTE" ou "PRESTADOR"

    string? Documento = null,
    string? Telefone = null,
    EnderecoDto? Endereco = null,
    DadosPrestadorDto? DadosPrestador = null
);

public record RegistroUsuarioResponse(
    int Id,
    string Nome,
    string Email,
    string Perfil,
    string Token,
    DateTime Expiracao,
    List<string> Roles
);
