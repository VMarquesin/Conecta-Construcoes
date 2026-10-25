namespace Conecta.Domain.Entidades;

public class Solicitacao
{
    public int Id { get; set; }
    public int ClienteId { get; set; }
    public int PrestadorId { get; set; }
    public int? CategoriaId { get; set; }
    public int? EnderecoId { get; set; }
    public string? EnderecoAtendimento { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public string Status { get; set; } = "ABERTA"; // ABERTA, AGUARDANDO_PROPOSTA, PROPOSTA_RECEBIDA, ACEITA, RECUSADA, CANCELADA
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;

    public Cliente Cliente { get; set; } = null!;
    public Prestador Prestador { get; set; } = null!;
    public Categoria? Categoria { get; set; }
    public Endereco? Endereco { get; set; }
    public ICollection<SolicitacaoImagem> Imagens { get; set; } = new List<SolicitacaoImagem>();
    public ICollection<Proposta> Propostas { get; set; } = new List<Proposta>();
}

public class SolicitacaoImagem
{
    public int Id { get; set; }
    public int SolicitacaoId { get; set; }
    public string ImagemUrl { get; set; } = string.Empty;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    public Solicitacao Solicitacao { get; set; } = null!;
}
