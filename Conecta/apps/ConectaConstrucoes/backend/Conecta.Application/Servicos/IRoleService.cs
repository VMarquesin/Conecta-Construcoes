using Conecta.Application.DTOs;

namespace Conecta.Application.Servicos;

public interface IRoleService
{
    Task<RoleResponse?> ObterPorIdAsync(int id);
    Task<IEnumerable<RoleResponse>> ListarAsync(bool apenasAtivos = false);
    Task<RoleResponse> CriarAsync(CriarRoleRequest request);
    Task<RoleResponse> AtualizarAsync(int id, AtualizarRoleRequest request);
    Task RemoverAsync(int id);
    Task AssociarPermissaoAsync(int roleId, int permissaoId);
    Task RemoverPermissaoAsync(int roleId, int permissaoId);
    Task<IEnumerable<string>> ObterPermissoesAsync(int roleId);
}
