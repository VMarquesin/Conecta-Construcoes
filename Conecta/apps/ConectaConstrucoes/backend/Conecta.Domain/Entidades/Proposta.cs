using Conecta.Domain.Enums;

namespace Conecta.Domain.Entidades;

public class Proposta
{
    public int Id { get; set; }
    public int SolicitacaoId { get; set; }
    public int PrestadorId { get; set; }
    public decimal ValorTotal { get; set; }
    public int? PrazoDias { get; set; }
    public string? Descricao { get; set; }
    public StatusProposta Status { get; set; } = StatusProposta.ENVIADA;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;

    public Solicitacao Solicitacao { get; set; } = null!;
    public Prestador Prestador { get; set; } = null!;
    public ICollection<PropostaItem> Itens { get; set; } = new List<PropostaItem>();
}

public class PropostaItem
{
    public int Id { get; set; }
    public int PropostaId { get; set; }
    public string? Descricao { get; set; }
    public decimal Valor { get; set; }
    public int Quantidade { get; set; } = 1;

    public Proposta Proposta { get; set; } = null!;
}
