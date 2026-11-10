namespace Conecta.Application.DTOs;

public record PedidoResumoResponse(
    int Id,
    int PrestadorId,
    string PrestadorNome,
    string PrestadorProfissao,
    string PrestadorAvatar,
    string SolicitadoEm,
    string Status, // "pendente", "aceito", "concluido", "cancelado"
    string StatusTexto,
    string TituloServico,
    string DescricaoServico,
    string ValorLabel,
    string ValorTexto,
    bool ValorIsPreco,
    string StatusDica,
    string DicaIcone, // "clock", "truck", "calendar", "check"
    bool PodeAvaliar = false,
    bool JaAvaliado = false
);

public record PedidoDetalheResponse(
    int Id,
    int ClienteId,
    string ClienteNome,
    int PrestadorId,
    string PrestadorNome,
    string PrestadorProfissao,
    string PrestadorAvatar,
    string TituloServico,
    string DescricaoServico,
    string Status,
    string StatusTexto,
    decimal? ValorCombinado,
    decimal? ValorFinal,
    DateTime DataCriacao,
    DateTime? AgendadoPara,
    DateTime? ConcluidoEm,
    string? EnderecoAtendimento,
    PropostaResponse? Proposta,
    bool PodeAvaliar,
    bool JaAvaliado
);

public record PagamentoPedidoRequest(
    string MetodoPagamento = "pix" // "pix" ou "cartao"
);
