using Conecta.Application.DTOs;

namespace Conecta.Application.Servicos;

public interface IPermissaoService
{
    Task<PermissaoResponse?> ObterPorIdAsync(int id);
    Task<IEnumerable<PermissaoResponse>> ListarAsync(string? recurso = null);
    Task<PermissaoResponse> CriarAsync(CriarPermissaoRequest request);
    Task<IEnumerable<string>> ObterPermissoesDoUsuarioAsync(int usuarioId);
}
