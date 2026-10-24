using Conecta.Domain.Entidades;

namespace Conecta.Domain.Interfaces;

public interface IUsuarioRepository
{
    Task<Usuario?> ObterPorIdAsync(int id);
    Task<Usuario?> ObterPorEmailAsync(string email);
    Task<IEnumerable<Usuario>> ListarAsync(int pagina = 1, int tamanhoPagina = 20, string? busca = null);
    Task<int> ContarAsync(string? busca = null);
    Task<Usuario> AdicionarAsync(Usuario usuario);
    Task AtualizarAsync(Usuario usuario);
    Task RemoverAsync(Usuario usuario);

    Task<IEnumerable<Role>> ObterRolesDoUsuarioAsync(int usuarioId);
    Task AdicionarRoleAsync(int usuarioId, int roleId);
    Task RemoverRoleAsync(int usuarioId, int roleId);
    Task<bool> UsuarioPossuiRoleAsync(int usuarioId, int roleId);
}
