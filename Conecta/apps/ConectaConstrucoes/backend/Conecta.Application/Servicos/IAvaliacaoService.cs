using Conecta.Application.DTOs;

namespace Conecta.Application.Servicos;

public interface IAvaliacaoService
{
    Task<AvaliacaoResponse> CriarAvaliacaoAsync(int clienteId, CriarAvaliacaoRequest request);
    Task<IEnumerable<AvaliacaoResponse>> ListarAvaliacoesDoPrestadorAsync(int prestadorId);
}
