using Conecta.Application.DTOs;

namespace Conecta.Application.Servicos;

public interface IPedidoService
{
    Task<IEnumerable<PedidoResumoResponse>> ListarMeusPedidosAsync(int usuarioId, string? status = null);
    Task<PedidoDetalheResponse?> ObterDetalhesAsync(int pedidoId, int usuarioId);
    Task<PedidoDetalheResponse> AceitarPropostaECriarPedidoAsync(int clienteId, int propostaId);
    Task ConfirmarPagamentoGarantiaAsync(int clienteId, int pedidoId, PagamentoPedidoRequest request);
    Task CancelarPedidoAsync(int usuarioId, int pedidoId);
    Task ConcluirPedidoAsync(int prestadorId, int pedidoId);
}
