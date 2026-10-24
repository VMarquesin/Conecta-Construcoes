namespace Conecta.Domain.Entidades;

public class Usuario
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string SenhaHash { get; set; } = string.Empty;
    public string Tipo { get; set; } = "CLIENTE";
    public string StatusVerificacao { get; set; } = "COMPLETO";
    public string StatusConta { get; set; } = "ATIVA";
    public DateTime? UltimoAcessoEm { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;

    public ICollection<UsuarioRole> UsuarioRoles { get; set; } = new List<UsuarioRole>();
}
