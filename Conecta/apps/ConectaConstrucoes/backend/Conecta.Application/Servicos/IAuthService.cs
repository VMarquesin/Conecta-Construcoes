using Conecta.Application.DTOs;

namespace Conecta.Application.Servicos;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request);
}
