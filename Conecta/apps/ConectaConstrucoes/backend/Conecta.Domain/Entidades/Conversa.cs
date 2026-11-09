using Conecta.Domain.Enums;

namespace Conecta.Domain.Entidades;

public class Conversa
{
    public int Id { get; set; }
    public int? PedidoId { get; set; }
    public int ClienteId { get; set; }
    public int PrestadorId { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;

    public Cliente Cliente { get; set; } = null!;
    public Prestador Prestador { get; set; } = null!;
    public Pedido? Pedido { get; set; }
    public ICollection<Mensagem> Mensagens { get; set; } = new List<Mensagem>();
}

public class Mensagem
{
    public int Id { get; set; }
    public int ConversaId { get; set; }
    public int RemetenteId { get; set; }
    public TipoMensagem Tipo { get; set; } = TipoMensagem.TEXTO;
    public string? Conteudo { get; set; }
    public bool Lida { get; set; } = false;
    public DateTime? LidaEm { get; set; }
    public DateTime EnviadoEm { get; set; } = DateTime.UtcNow;

    public Conversa Conversa { get; set; } = null!;
    public Usuario Remetente { get; set; } = null!;
    public ICollection<MensagemAnexo> Anexos { get; set; } = new List<MensagemAnexo>();
}

public class MensagemAnexo
{
    public int Id { get; set; }
    public int MensagemId { get; set; }
    public string? ArquivoUrl { get; set; }
    public string? TipoArquivo { get; set; }
    public int? TamanhoBytes { get; set; }

    public Mensagem Mensagem { get; set; } = null!;
}
