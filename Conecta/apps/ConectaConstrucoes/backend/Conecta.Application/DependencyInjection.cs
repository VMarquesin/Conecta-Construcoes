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
        services.AddScoped<ICategoriaService, CategoriaService>();
        services.AddScoped<IPrestadorService, PrestadorService>();
        services.AddScoped<ISolicitacaoService, SolicitacaoService>();
        services.AddScoped<IPedidoService, PedidoService>();
        services.AddScoped<IChatService, ChatService>();
        services.AddScoped<IProService, ProService>();
        services.AddScoped<IAvaliacaoService, AvaliacaoService>();
        services.AddScoped<IAdminService, AdminService>();

        return services;
    }
}
