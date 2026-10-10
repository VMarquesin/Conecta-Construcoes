using Conecta.Domain.Interfaces;
using Conecta.Infrastructure.Data;
using Conecta.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Conecta.Infrastructure;

public static class DependencyInjection
{
    /// <summary>
    /// Registra os serviços da camada de infraestrutura (EF Core, Dapper e Evolve Migrations).
    /// </summary>
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' não encontrada na configuração.");

        // 1. EF Core para PostgreSQL (Escrita e modelo de domínio)
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));

        // 2. Dapper (Fábrica de conexões para leituras otimizadas)
        services.AddSingleton<IDbConnectionFactory, DbConnectionFactory>();

        // 3. Evolve (Migrações e versionamento de schema do banco)
        services.AddScoped<EvolveDatabaseMigrator>();

        return services;
    }
}
