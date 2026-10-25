using Conecta.Domain.Entidades;

namespace Conecta.Domain.Interfaces;

public interface IPedidoRepository
{
    Task<Pedido> AdicionarAsync(Pedido pedido);
    Task<Pedido?> ObterPorIdAsync(int id);
    Task<IEnumerable<Pedido>> ListarPorUsuarioAsync(int usuarioId, string? status = null);
    Task AtualizarStatusAsync(int pedidoId, string novoStatus);
    Task AtualizarAsync(Pedido pedido);
}
