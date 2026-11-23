using Conecta.Domain.Entidades;

namespace Conecta.Domain.Interfaces;

public interface IPermissaoRepository
{
    Task<Permissao?> ObterPorIdAsync(int id);
    Task<Permissao?> ObterPorNomeAsync(string nome);
    Task<IEnumerable<Permissao>> ListarAsync(string? recurso = null);
    Task<Permissao> AdicionarAsync(Permissao permissao);
    Task<IEnumerable<Permissao>> ObterPermissoesDoUsuarioAsync(int usuarioId);
}
