namespace Conecta.Domain.Entidades;

public class Avaliacao
{
    public int Id { get; set; }
    public int PedidoId { get; set; }
    public int ClienteId { get; set; }
    public int PrestadorId { get; set; }
    public int Nota { get; set; } // 1 a 5
    public string? Comentario { get; set; }
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;

    public Cliente Cliente { get; set; } = null!;
    public Prestador Prestador { get; set; } = null!;
}
