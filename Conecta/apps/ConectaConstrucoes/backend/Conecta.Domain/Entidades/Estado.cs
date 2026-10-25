namespace Conecta.Domain.Entidades;

public class Estado
{
    public int Id { get; set; }
    public string Sigla { get; set; } = string.Empty; // SP
    public string Nome { get; set; } = string.Empty;  // São Paulo

    public ICollection<Cidade> Cidades { get; set; } = new List<Cidade>();
}
