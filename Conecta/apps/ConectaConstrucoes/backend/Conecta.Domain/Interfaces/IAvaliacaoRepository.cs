using Conecta.Domain.Entidades;

namespace Conecta.Domain.Interfaces;

public interface IAvaliacaoRepository
{
    Task<Avaliacao> AdicionarAsync(Avaliacao avaliacao);
    Task<Avaliacao?> ObterPorIdAsync(int id);
    Task<Avaliacao?> ObterPorPedidoIdAsync(int pedidoId);
    Task<IEnumerable<Avaliacao>> ListarPorPrestadorAsync(int prestadorId);
}
