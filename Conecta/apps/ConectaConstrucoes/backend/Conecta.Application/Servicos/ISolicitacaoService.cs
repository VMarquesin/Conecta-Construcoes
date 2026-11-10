using Conecta.Application.DTOs;

namespace Conecta.Application.Servicos;

public interface ISolicitacaoService
{
    Task<SolicitacaoResponse> CriarAsync(int clienteId, CriarSolicitacaoRequest request);
    Task<SolicitacaoResponse?> ObterPorIdAsync(int solicitacaoId);
    Task<IEnumerable<SolicitacaoResponse>> ListarPorClienteAsync(int clienteId);
    Task<PropostaResponse> EnviarPropostaAsync(int prestadorId, int solicitacaoId, EnviarPropostaRequest request);
    Task RecusarSolicitacaoAsync(int prestadorId, int solicitacaoId);
    Task CancelarSolicitacaoAsync(int clienteId, int solicitacaoId);
}
