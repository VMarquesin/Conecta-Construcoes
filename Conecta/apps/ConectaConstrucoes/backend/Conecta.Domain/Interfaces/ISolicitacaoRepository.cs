using Conecta.Domain.Entidades;

namespace Conecta.Domain.Interfaces;

public interface ISolicitacaoRepository
{
    Task<Solicitacao> AdicionarAsync(Solicitacao solicitacao);
    Task<Solicitacao?> ObterPorIdAsync(int id);
    Task<IEnumerable<Solicitacao>> ListarPorClienteAsync(int clienteId);
    Task<IEnumerable<Solicitacao>> ListarPendentesPorPrestadorAsync(int prestadorId);
    Task AtualizarStatusAsync(int solicitacaoId, string novoStatus);
    Task<Proposta> AdicionarPropostaAsync(Proposta proposta);
    Task<Proposta?> ObterPropostaPorIdAsync(int propostaId);
    Task AtualizarStatusPropostaAsync(int propostaId, string novoStatus);
}
