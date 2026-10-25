using Conecta.Application.DTOs;

namespace Conecta.Application.Servicos;

public interface IPrestadorService
{
    Task<PrestadorBuscaPaginadaResponse> BuscarAsync(FiltroBuscaPrestadorRequest request);
    Task<PrestadorPerfilDetalhadoResponse?> ObterPerfilDetalhadoAsync(int prestadorId, int? clienteIdLogado = null);
    Task<bool> AlternarFavoritoAsync(int clienteId, int prestadorId);
}
