using Conecta.Application.DTOs;

namespace Conecta.Application.Servicos;

public interface IUsuarioService
{
    Task<UsuarioResponse?> ObterPorIdAsync(int id);
    Task<UsuarioResponse?> ObterPorEmailAsync(string email);
    Task<UsuarioPaginadoResponse> ListarAsync(int pagina = 1, int tamanhoPagina = 20, string? busca = null);
    Task<UsuarioResponse> CriarAsync(CriarUsuarioRequest request);
    Task<UsuarioResponse> AtualizarAsync(int id, AtualizarUsuarioRequest request);
    Task AlterarSenhaAsync(int id, AlterarSenhaRequest request);
    Task RemoverAsync(int id);
    Task AssociarRoleAsync(int usuarioId, int roleId);
    Task RemoverRoleAsync(int usuarioId, int roleId);
    Task<IEnumerable<string>> ObterRolesAsync(int usuarioId);
}
