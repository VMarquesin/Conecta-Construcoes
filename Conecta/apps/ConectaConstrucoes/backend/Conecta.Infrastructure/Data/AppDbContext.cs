using Microsoft.EntityFrameworkCore;

namespace Conecta.Infrastructure.Data;

/// <summary>
/// Contexto do EF Core para operações de escrita e persistência de agregados de domínio.
/// O schema é versionado exclusivamente via migrações SQL com o Evolve.
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
