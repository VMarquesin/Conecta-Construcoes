using Conecta.Application.Servicos;
using Conecta.Application.Servicos.Seguranca;
using Microsoft.Extensions.DependencyInjection;

namespace Conecta.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Serviços de Segurança
        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddScoped<ITokenService, TokenService>();

        // Serviços de Negócio
        services.AddScoped<IUsuarioService, UsuarioService>();
        services.AddScoped<IRoleService, RoleService>();
        services.AddScoped<IPermissaoService, PermissaoService>();
        services.AddScoped<IAuthService, AuthService>();

        return services;
    }
}
