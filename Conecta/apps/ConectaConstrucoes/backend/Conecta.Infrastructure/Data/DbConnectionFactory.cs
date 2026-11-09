using System.Data;
using Conecta.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Npgsql;

namespace Conecta.Infrastructure.Data;

/// <summary>
/// Fábrica de conexões PostgreSQL para consultas otimizadas via Dapper.
/// </summary>
public class DbConnectionFactory : IDbConnectionFactory
{
    private readonly NpgsqlDataSource _dataSource;

    public DbConnectionFactory(NpgsqlDataSource dataSource)
    {
        _dataSource = dataSource;
    }

    public IDbConnection CreateConnection()
    {
        return _dataSource.CreateConnection();
    }
}
