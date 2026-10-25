namespace Conecta.Domain.Entidades;

public class AuditLog
{
    public int Id { get; set; }
    public int? UsuarioId { get; set; }
    public string TabelaAfetada { get; set; } = string.Empty;
    public int? IdRegistro { get; set; }
    public string Acao { get; set; } = string.Empty;
    public string? DadosAntes { get; set; }
    public string? DadosDepois { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}
