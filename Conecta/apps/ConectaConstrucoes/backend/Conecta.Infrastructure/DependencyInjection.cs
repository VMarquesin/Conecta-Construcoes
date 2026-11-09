using Conecta.Domain.Enums;
using Conecta.Domain.Interfaces;
using Conecta.Infrastructure.Data;
using Conecta.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;
using Npgsql.NameTranslation;

namespace Conecta.Infrastructure;

public static class DependencyInjection
{
    /// <summary>
    /// Registra os serviços da camada de infraestrutura (EF Core, Dapper e Evolve Migrations).
    /// </summary>
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Compatibilidade global com timestamps legados no Npgsql
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' não encontrada na configuração.");

        // 0. NpgsqlDataSource com mapeamento de todos os Enums nativos do PostgreSQL
        var nullTranslator = new NpgsqlNullNameTranslator();
        var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
        dataSourceBuilder.MapEnum<StatusDisponibilidade>("status_disponibilidade", nullTranslator);
        dataSourceBuilder.MapEnum<StatusSolicitacao>("status_solicitacao", nullTranslator);
        dataSourceBuilder.MapEnum<StatusProposta>("status_proposta", nullTranslator);
        dataSourceBuilder.MapEnum<StatusPedido>("status_pedido", nullTranslator);
        dataSourceBuilder.MapEnum<TipoMensagem>("tipo_mensagem", nullTranslator);
        dataSourceBuilder.MapEnum<StatusVerificacao>("status_verificacao", nullTranslator);
        dataSourceBuilder.MapEnum<StatusConta>("status_conta", nullTranslator);
        dataSourceBuilder.MapEnum<StatusDocumento>("status_documento", nullTranslator);
        dataSourceBuilder.MapEnum<TipoDenuncia>("tipo_denuncia", nullTranslator);
        dataSourceBuilder.MapEnum<StatusDenuncia>("status_denuncia", nullTranslator);
        dataSourceBuilder.EnableUnmappedTypes();
        var dataSource = dataSourceBuilder.Build();

        services.AddSingleton(dataSource);

        // 1. EF Core para PostgreSQL (Escrita e modelo de domínio)
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(dataSource, o =>
            {
                o.MapEnum<StatusDisponibilidade>("status_disponibilidade", nameTranslator: nullTranslator);
                o.MapEnum<StatusSolicitacao>("status_solicitacao", nameTranslator: nullTranslator);
                o.MapEnum<StatusProposta>("status_proposta", nameTranslator: nullTranslator);
                o.MapEnum<StatusPedido>("status_pedido", nameTranslator: nullTranslator);
                o.MapEnum<TipoMensagem>("tipo_mensagem", nameTranslator: nullTranslator);
                o.MapEnum<StatusVerificacao>("status_verificacao", nameTranslator: nullTranslator);
                o.MapEnum<StatusConta>("status_conta", nameTranslator: nullTranslator);
                o.MapEnum<StatusDocumento>("status_documento", nameTranslator: nullTranslator);
                o.MapEnum<TipoDenuncia>("tipo_denuncia", nameTranslator: nullTranslator);
                o.MapEnum<StatusDenuncia>("status_denuncia", nameTranslator: nullTranslator);
            }));

        // 2. Dapper (Fábrica de conexões para leituras otimizadas)
        services.AddSingleton<IDbConnectionFactory, DbConnectionFactory>();

        // 3. Evolve (Migrações e versionamento de schema do banco)
        services.AddScoped<EvolveDatabaseMigrator>();

        // 4. Repositórios RBAC e Negócio
        services.AddScoped<IUsuarioRepository, Repositorios.UsuarioRepository>();
        services.AddScoped<IRoleRepository, Repositorios.RoleRepository>();
        services.AddScoped<IPermissaoRepository, Repositorios.PermissaoRepository>();
        services.AddScoped<ICategoriaRepository, Repositorios.CategoriaRepository>();
        services.AddScoped<IPrestadorRepository, Repositorios.PrestadorRepository>();
        services.AddScoped<ISolicitacaoRepository, Repositorios.SolicitacaoRepository>();
        services.AddScoped<IPedidoRepository, Repositorios.PedidoRepository>();
        services.AddScoped<IChatRepository, Repositorios.ChatRepository>();
        services.AddScoped<IAvaliacaoRepository, Repositorios.AvaliacaoRepository>();
        services.AddScoped<IAdminRepository, Repositorios.AdminRepository>();

        return services;
    }
}
