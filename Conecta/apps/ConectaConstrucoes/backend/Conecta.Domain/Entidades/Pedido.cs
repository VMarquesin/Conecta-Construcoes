using Conecta.Domain.Enums;

namespace Conecta.Domain.Entidades;

public class Pedido
{
    public int Id { get; set; }
    public int ClienteId { get; set; }
    public int PrestadorId { get; set; }
    public int? PropostaId { get; set; }
    public int? EnderecoId { get; set; }
    public string? EnderecoAtendimento { get; set; }
    public string DescricaoNecessidade { get; set; } = string.Empty;
    public StatusPedido Status { get; set; } = StatusPedido.AGUARDANDO_ACEITE;
    public decimal? ValorCombinado { get; set; }
    public decimal? ValorFinal { get; set; }
    public DateTime DataSolicitacao { get; set; } = DateTime.UtcNow;
    public DateTime? DataConclusao { get; set; }
    public DateTime? AgendadoPara { get; set; }
    public DateTime? IniciadoEm { get; set; }
    public DateTime? ConcluidoEm { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;

    public Cliente Cliente { get; set; } = null!;
    public Prestador Prestador { get; set; } = null!;
    public Proposta? Proposta { get; set; }
    public Endereco? Endereco { get; set; }
    public Avaliacao? Avaliacao { get; set; }
}
