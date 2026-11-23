namespace Conecta.Domain.Entidades;

public class Cidade
{
    public int Id { get; set; }
    public int EstadoId { get; set; }
    public string Nome { get; set; } = string.Empty;

    public Estado Estado { get; set; } = null!;
    public ICollection<Endereco> Enderecos { get; set; } = new List<Endereco>();
}
