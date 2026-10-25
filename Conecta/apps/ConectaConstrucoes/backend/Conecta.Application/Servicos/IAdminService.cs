using Conecta.Application.DTOs;

namespace Conecta.Application.Servicos;

public interface IAdminService
{
    Task<ResumoAdminResponse> ObterResumoAsync();
    Task<IEnumerable<AdminUsuarioResponse>> ListarUsuariosAsync(string? busca, string? tipo, string? status);
    Task<AdminUsuarioResponse?> ObterUsuarioPorIdAsync(int id);
    Task<AdminUsuarioResponse> AtualizarUsuarioAsync(int id, AtualizarUsuarioAdminRequest request);
    Task BloquearUsuarioAsync(int id, string motivo, int adminId);
    Task DesbloquearUsuarioAsync(int id, int adminId);
    Task<IEnumerable<AdminRoleResponse>> ListarRolesAsync();
    Task AtribuirRoleAsync(int usuarioId, int roleId);
    Task RemoverRoleAsync(int usuarioId, int roleId);
    Task<IEnumerable<AdminDocumentoResponse>> ListarDocumentosPendentesAsync();
    Task AprovarDocumentoAsync(int documentoId, int adminId);
    Task RejeitarDocumentoAsync(int documentoId, string motivo, int adminId);
    Task<IEnumerable<AdminDenunciaResponse>> ListarDenunciasAsync();
    Task ModerarDenunciaAsync(int denunciaId, string acao, string? observacao, int adminId);
}
