using Conecta.Application.DTOs;

namespace Conecta.Application.Servicos;

public interface IChatService
{
    Task<IEnumerable<ConversaResumoResponse>> ListarConversasDoUsuarioAsync(int usuarioId);
    Task<ConversaResumoResponse?> ObterConversaAsync(int conversaId, int usuarioId);
    Task<ConversaResumoResponse> IniciarConversaAsync(int clienteId, IniciarConversaRequest request);
    Task<IEnumerable<MensagemItemResponse>> ListarMensagensAsync(int conversaId, int usuarioId);
    Task<MensagemItemResponse> EnviarMensagemAsync(int remetenteId, int conversaId, EnviarMensagemRequest request);
    Task MarcarComoLidasAsync(int conversaId, int usuarioLeitorId);
    Task<int> ObterTotalNaoLidasAsync(int usuarioId);
}
