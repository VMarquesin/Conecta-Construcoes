using Conecta.Domain.Enums;

namespace Conecta.Domain.Entidades;

public class Prestador
{
    public int UsuarioId { get; set; }
    public string? NomeFantasia { get; set; }
    public string? Bio { get; set; }
    public int? ExperienciaAnos { get; set; }
    public decimal? ValorHoraInicial { get; set; }
    public string? CapaUrl { get; set; }
    public decimal Latitude { get; set; } = 0;
    public decimal Longitude { get; set; } = 0;
    public int RaioAtendimentoKm { get; set; } = 15;
    public StatusDisponibilidade StatusDisponibilidade { get; set; } = StatusDisponibilidade.DISPONIVEL;
    public char PlanoAssinatura { get; set; } = 'G'; // 'G' Grátis, 'P' Premium
    public bool DestaqueRegiao { get; set; } = false;
    public bool SeloSuperprestador { get; set; } = false;
    public int? TempoMedioRespostaMinutos { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;

    public Usuario Usuario { get; set; } = null!;
}
