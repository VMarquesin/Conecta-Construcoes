using Conecta.Domain.Entidades;
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

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permissao> Permissoes => Set<Permissao>();
    public DbSet<UsuarioRole> UsuarioRoles => Set<UsuarioRole>();
    public DbSet<RolePermissao> RolePermissoes => Set<RolePermissao>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Mapeamento: usuarios
        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.ToTable("usuarios");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nome).HasColumnName("nome").HasMaxLength(150).IsRequired();
            entity.Property(e => e.Email).HasColumnName("email").HasMaxLength(100).IsRequired();
            entity.Property(e => e.SenhaHash).HasColumnName("senha_hash").HasMaxLength(255).IsRequired();
            entity.Property(e => e.Tipo).HasColumnName("tipo").HasMaxLength(20);
            entity.Property(e => e.StatusVerificacao).HasColumnName("status_verificacao").HasColumnType("varchar(50)");
            entity.Property(e => e.StatusConta).HasColumnName("status_conta").HasColumnType("varchar(50)");
            entity.Property(e => e.UltimoAcessoEm).HasColumnName("ultimo_acesso_em");
            entity.Property(e => e.CriadoEm).HasColumnName("criado_em");
            entity.Property(e => e.AtualizadoEm).HasColumnName("atualizado_em");

            entity.HasIndex(e => e.Email).IsUnique();
        });

        // Mapeamento: roles
        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("roles");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nome).HasColumnName("nome").HasMaxLength(50).IsRequired();
            entity.Property(e => e.Descricao).HasColumnName("descricao");
            entity.Property(e => e.Ativo).HasColumnName("ativo");
            entity.Property(e => e.CriadoEm).HasColumnName("criado_em");

            entity.HasIndex(e => e.Nome).IsUnique();
        });

        // Mapeamento: permissoes
        modelBuilder.Entity<Permissao>(entity =>
        {
            entity.ToTable("permissoes");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nome).HasColumnName("nome").HasMaxLength(100).IsRequired();
            entity.Property(e => e.Descricao).HasColumnName("descricao");
            entity.Property(e => e.Recurso).HasColumnName("recurso").HasMaxLength(50);
            entity.Property(e => e.Acao).HasColumnName("acao").HasMaxLength(50);
            entity.Property(e => e.CriadoEm).HasColumnName("criado_em");

            entity.HasIndex(e => e.Nome).IsUnique();
        });

        // Mapeamento: usuario_roles (N:N)
        modelBuilder.Entity<UsuarioRole>(entity =>
        {
            entity.ToTable("usuario_roles");
            entity.HasKey(e => new { e.UsuarioId, e.RoleId });
            entity.Property(e => e.UsuarioId).HasColumnName("usuario_id");
            entity.Property(e => e.RoleId).HasColumnName("role_id");
            entity.Property(e => e.AtribuidoEm).HasColumnName("atribuido_em");

            entity.HasOne(e => e.Usuario)
                .WithMany(u => u.UsuarioRoles)
                .HasForeignKey(e => e.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Role)
                .WithMany(r => r.UsuarioRoles)
                .HasForeignKey(e => e.RoleId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Mapeamento: role_permissoes (N:N)
        modelBuilder.Entity<RolePermissao>(entity =>
        {
            entity.ToTable("role_permissoes");
            entity.HasKey(e => new { e.RoleId, e.PermissaoId });
            entity.Property(e => e.RoleId).HasColumnName("role_id");
            entity.Property(e => e.PermissaoId).HasColumnName("permissao_id");
            entity.Property(e => e.AtribuidoEm).HasColumnName("atribuido_em");

            entity.HasOne(e => e.Role)
                .WithMany(r => r.RolePermissoes)
                .HasForeignKey(e => e.RoleId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Permissao)
                .WithMany(p => p.RolePermissoes)
                .HasForeignKey(e => e.PermissaoId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
