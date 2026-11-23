namespace Conecta.Domain.Entidades;

public class Endereco
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public int CidadeId { get; set; }
    public string? Bairro { get; set; }
    public string? Cep { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public bool Principal { get; set; } = true;
    public string Apelido { get; set; } = "Principal";
    public string Logradouro { get; set; } = string.Empty;
    public string Numero { get; set; } = "S/N";
    public string? Complemento { get; set; }
    public string CidadeNome { get; set; } = string.Empty;
    public string EstadoSigla { get; set; } = "SP";
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;

    public Usuario Usuario { get; set; } = null!;
    public Cidade Cidade { get; set; } = null!;
}
