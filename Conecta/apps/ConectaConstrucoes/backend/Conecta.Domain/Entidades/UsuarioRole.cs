namespace Conecta.Domain.Entidades;

public class UsuarioRole
{
    public int UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }

    public int RoleId { get; set; }
    public Role? Role { get; set; }

    public DateTime AtribuidoEm { get; set; } = DateTime.UtcNow;
}
