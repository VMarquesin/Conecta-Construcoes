using Conecta.Application.DTOs;

namespace Conecta.Application.Servicos;

public interface IAvaliacaoService
{
    Task<AvaliacaoResponse> CriarAvaliacaoAsync(int clienteId, CriarAvaliacaoRequest request);
    Task<AvaliacaoResponse> AtualizarAvaliacaoAsync(int id, int clienteId, AtualizarAvaliacaoRequest request);
    Task RemoverAvaliacaoAsync(int id, int clienteId);
    Task<IEnumerable<AvaliacaoResponse>> ListarAvaliacoesDoPrestadorAsync(int prestadorId);
}
