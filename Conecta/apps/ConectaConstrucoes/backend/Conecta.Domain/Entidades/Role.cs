namespace Conecta.Domain.Entidades;

public class Role
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public bool Ativo { get; set; } = true;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    public ICollection<UsuarioRole> UsuarioRoles { get; set; } = new List<UsuarioRole>();
    public ICollection<RolePermissao> RolePermissoes { get; set; } = new List<RolePermissao>();
}
