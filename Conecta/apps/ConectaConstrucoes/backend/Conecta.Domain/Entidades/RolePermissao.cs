namespace Conecta.Domain.Entidades;

public class RolePermissao
{
    public int RoleId { get; set; }
    public Role? Role { get; set; }

    public int PermissaoId { get; set; }
    public Permissao? Permissao { get; set; }

    public DateTime AtribuidoEm { get; set; } = DateTime.UtcNow;
}
