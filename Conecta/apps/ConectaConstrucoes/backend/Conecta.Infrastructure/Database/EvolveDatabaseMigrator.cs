using EvolveDb;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace Conecta.Infrastructure.Database;

/// <summary>
/// Responsável pelo versionamento e aplicação das migrações do banco de dados utilizando EvolveDb.
/// O Evolve é a única fonte da verdade para o schema do PostgreSQL.
/// </summary>
public class EvolveDatabaseMigrator
{
    private readonly string _connectionString;
    private readonly ILogger<EvolveDatabaseMigrator> _logger;

    public EvolveDatabaseMigrator(IConfiguration configuration, ILogger<EvolveDatabaseMigrator> logger)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' não configurada.");
        _logger = logger;
    }

    /// <summary>
    /// Executa as migrações SQL pendentes encontradas no diretório de migrações.
    /// </summary>
    public void Migrate()
    {
        try
        {
            var migrationsPath = Path.Combine(AppContext.BaseDirectory, "Database", "Migrations");

            _logger.LogInformation("Iniciando migrações do banco de dados com Evolve...");
            _logger.LogInformation("Diretório de migrações: {Path}", migrationsPath);

            if (!Directory.Exists(migrationsPath))
            {
                _logger.LogWarning("Diretório de migrações não encontrado em {Path}. Criando diretório...", migrationsPath);
                Directory.CreateDirectory(migrationsPath);
            }

            using var connection = new NpgsqlConnection(_connectionString);

            var evolve = new EvolveDb.Evolve(connection, msg => _logger.LogInformation("[Evolve] {Message}", msg))
            {
                Locations = new[] { migrationsPath },
                IsEraseDisabled = true,
                CommandTimeout = 120
            };

            evolve.Migrate();

            _logger.LogInformation("Migrações do banco de dados aplicadas com sucesso pelo Evolve.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Falha crítica ao aplicar migrações do banco de dados com Evolve.");
            throw;
        }
    }
}
