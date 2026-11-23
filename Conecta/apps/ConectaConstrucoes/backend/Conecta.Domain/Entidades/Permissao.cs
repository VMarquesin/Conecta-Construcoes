namespace Conecta.Domain.Entidades;

public class Permissao
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public string? Recurso { get; set; }
    public string? Acao { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    public ICollection<RolePermissao> RolePermissoes { get; set; } = new List<RolePermissao>();
}
