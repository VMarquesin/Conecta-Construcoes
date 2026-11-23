using Conecta.Domain.Entidades;

namespace Conecta.Domain.Interfaces;

public interface IAvaliacaoRepository
{
    Task<Avaliacao> AdicionarAsync(Avaliacao avaliacao);
    Task<Avaliacao?> ObterPorIdAsync(int id);
    Task<Avaliacao?> ObterPorPedidoIdAsync(int pedidoId);
    Task<Avaliacao?> ObterPorClienteEPrestadorAsync(int clienteId, int prestadorId);
    Task<IEnumerable<Avaliacao>> ListarPorPrestadorAsync(int prestadorId);
    Task AtualizarAsync(Avaliacao avaliacao);
    Task RemoverAsync(Avaliacao avaliacao);
}
