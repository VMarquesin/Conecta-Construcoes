namespace Conecta.Domain.Entidades;

public class Portfolio
{
    public int Id { get; set; }
    public int PrestadorId { get; set; }
    public string? Titulo { get; set; }
    public string? Descricao { get; set; }
    public bool Destaque { get; set; } = false;
    public int TotalVisualizacoes { get; set; } = 0;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;

    public Prestador Prestador { get; set; } = null!;
    public ICollection<PortfolioImagem> Imagens { get; set; } = new List<PortfolioImagem>();
}

public class PortfolioImagem
{
    public int Id { get; set; }
    public int PortfolioId { get; set; }
    public string ImagemUrl { get; set; } = string.Empty;
    public int Ordem { get; set; } = 1;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    public Portfolio Portfolio { get; set; } = null!;
}
