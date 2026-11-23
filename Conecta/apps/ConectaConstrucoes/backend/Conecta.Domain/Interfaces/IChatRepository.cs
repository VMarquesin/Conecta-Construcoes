using Conecta.Domain.Entidades;

namespace Conecta.Domain.Interfaces;

public interface IChatRepository
{
    Task<Conversa?> ObterPorIdAsync(int id);
    Task<Conversa?> ObterPorPedidoIdAsync(int pedidoId);
    Task<Conversa?> ObterOuCriarAsync(int clienteId, int prestadorId, int? pedidoId = null);
    Task<IEnumerable<Conversa>> ListarConversasDoUsuarioAsync(int usuarioId);
    Task<IEnumerable<Mensagem>> ListarMensagensDaConversaAsync(int conversaId);
    Task<Mensagem> AdicionarMensagemAsync(Mensagem mensagem);
    Task MarcarComoLidasAsync(int conversaId, int usuarioLeitorId);
    Task<int> ContarNaoLidasAsync(int usuarioId);
}
