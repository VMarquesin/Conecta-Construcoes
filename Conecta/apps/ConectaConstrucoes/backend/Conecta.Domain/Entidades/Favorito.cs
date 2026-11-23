namespace Conecta.Domain.Entidades;

public class Favorito
{
    public int ClienteId { get; set; }
    public int PrestadorId { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    public Cliente Cliente { get; set; } = null!;
    public Prestador Prestador { get; set; } = null!;
}
