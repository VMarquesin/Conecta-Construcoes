using Conecta.Application.DTOs;

namespace Conecta.Application.Servicos;

public interface IProService
{
    Task<ProDashboardResponse> ObterDashboardAsync(int prestadorId);
    Task AtualizarDisponibilidadeAsync(int prestadorId, string status);
    Task AtualizarBioAsync(int prestadorId, string bio);
    Task<IEnumerable<FotoPortfolioDto>> ObterPortfolioAsync(int prestadorId);
    Task<FotoPortfolioDto> AdicionarItemPortfolioAsync(int prestadorId, CriarItemPortfolioRequest request);
    Task RemoverItemPortfolioAsync(int prestadorId, int portfolioId);
}
