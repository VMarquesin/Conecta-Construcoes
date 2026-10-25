namespace Conecta.Domain.Entidades;

public class Cliente
{
    public int UsuarioId { get; set; }
    public bool Ativo { get; set; } = true;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;

    public Usuario Usuario { get; set; } = null!;
}
