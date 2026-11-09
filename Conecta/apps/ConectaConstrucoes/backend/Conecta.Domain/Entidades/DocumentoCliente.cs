using Conecta.Domain.Enums;

namespace Conecta.Domain.Entidades;

public class DocumentoCliente
{
    public int Id { get; set; }
    public int ClienteId { get; set; }
    public string TipoDocumento { get; set; } = string.Empty;
    public string ArquivoUrl { get; set; } = string.Empty;
    public StatusDocumento Status { get; set; } = StatusDocumento.PENDENTE;
    public string? MotivoRejeicao { get; set; }
    public DateTime SubmetidoEm { get; set; } = DateTime.UtcNow;
    public DateTime? AnalisadoEm { get; set; }
    public int? AnalisadoPor { get; set; }

    public Cliente Cliente { get; set; } = null!;
}
