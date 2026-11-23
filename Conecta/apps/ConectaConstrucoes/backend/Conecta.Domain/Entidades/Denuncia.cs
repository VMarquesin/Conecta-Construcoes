using Conecta.Domain.Enums;

namespace Conecta.Domain.Entidades;

public class Denuncia
{
    public int Id { get; set; }
    public int UsuarioDenuncianteId { get; set; }
    public int UsuarioDenunciadoId { get; set; }
    public TipoDenuncia TipoDenuncia { get; set; } = TipoDenuncia.OUTRO;
    public string Motivo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public StatusDenuncia Status { get; set; } = StatusDenuncia.ABERTA;
    public int? AnalisadoPor { get; set; }
    public string? Resultado { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime? AnalisadoEm { get; set; }

    public Usuario UsuarioDenunciante { get; set; } = null!;
    public Usuario UsuarioDenunciado { get; set; } = null!;
}
