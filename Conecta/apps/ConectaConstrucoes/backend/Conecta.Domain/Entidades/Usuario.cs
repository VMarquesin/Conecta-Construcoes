using Conecta.Domain.Enums;

namespace Conecta.Domain.Entidades;

public class Usuario
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string SenhaHash { get; set; } = string.Empty;
    public string Perfil { get; set; } = "CLIENTE"; // PRESTADOR, CLIENTE, ADMIN
    public bool Ativo { get; set; } = true;
    public string? Documento { get; set; }
    public bool Verificado { get; set; } = false;
    public string? FotoPerfilUrl { get; set; }
    public decimal MediaAvaliacao { get; set; } = 0.00m;
    public int TotalAvaliacoes { get; set; } = 0;
    public DateTime? TermosAceitosEm { get; set; }
    public StatusVerificacao StatusVerificacao { get; set; } = StatusVerificacao.COMPLETO;
    public StatusConta StatusConta { get; set; } = StatusConta.ATIVA;
    public DateTime? UltimoAcessoEm { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;

    // Propriedades de navegação
    public Cliente? Cliente { get; set; }
    public Prestador? Prestador { get; set; }
    public ICollection<UsuarioRole> UsuarioRoles { get; set; } = new List<UsuarioRole>();
    public ICollection<Endereco> Enderecos { get; set; } = new List<Endereco>();
    public ICollection<Telefone> Telefones { get; set; } = new List<Telefone>();
}
