using Conecta.Domain.Entidades;

namespace Conecta.Domain.Interfaces;

public interface IRoleRepository
{
    Task<Role?> ObterPorIdAsync(int id);
    Task<Role?> ObterPorNomeAsync(string nome);
    Task<IEnumerable<Role>> ListarAsync(bool apenasAtivos = false);
    Task<Role> AdicionarAsync(Role role);
    Task AtualizarAsync(Role role);
    Task RemoverAsync(Role role);

    Task<IEnumerable<Permissao>> ObterPermissoesDaRoleAsync(int roleId);
    Task AdicionarPermissaoAsync(int roleId, int permissaoId);
    Task RemoverPermissaoAsync(int roleId, int permissaoId);
    Task<bool> RolePossuiPermissaoAsync(int roleId, int permissaoId);
}
