namespace Conecta.Domain.Entidades;

public class Denuncia
{
    public int Id { get; set; }
    public int UsuarioDenuncianteId { get; set; }
    public int UsuarioDenunciadoId { get; set; }
    public string TipoDenuncia { get; set; } = "OUTRO";
    public string Motivo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public string Status { get; set; } = "ABERTA"; // ABERTA, ANALISANDO, ENCERRADA, RESOLVIDA, BANIDO
    public int? AnalisadoPor { get; set; }
    public string? Resultado { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime? AnalisadoEm { get; set; }

    public Usuario UsuarioDenunciante { get; set; } = null!;
    public Usuario UsuarioDenunciado { get; set; } = null!;
}
