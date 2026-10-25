namespace Conecta.Domain.Entidades;

public class Telefone
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public string Numero { get; set; } = string.Empty;
    public bool Principal { get; set; } = false;
    public string Tipo { get; set; } = "WHATSAPP";
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    public Usuario Usuario { get; set; } = null!;
}
