using System.ComponentModel.DataAnnotations;

namespace Conecta.Application.DTOs;

public record MensagemItemResponse(
    string Id,
    string Remetente, // "usuario" ou "prestador"
    string? Texto,
    string? ImagemUrl,
    string? ImagemLegenda,
    string Hora,
    string? Status,
    bool IsProposta = false
);

public record ConversaResumoResponse(
    string Id,
    int ConversaId,
    int PrestadorId,
    string Nome,
    string Profissao,
    string Avatar,
    bool Online,
    string StatusTexto,
    bool NaoLida,
    string UltimaMensagem,
    string Tempo,
    string? PedidoNumero,
    List<MensagemItemResponse> Mensagens
);

public record EnviarMensagemRequest(
    [Required(ErrorMessage = "O conteúdo ou anexo da mensagem é obrigatório.")]
    string? Texto,

    string? ImagemUrl = null,
    string? ImagemLegenda = null
);

public record IniciarConversaRequest(
    [Required] int PrestadorId,
    int? PedidoId = null
);
