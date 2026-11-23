using Conecta.Domain.Entidades;
using Conecta.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Npgsql.NameTranslation;

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
    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<Prestador> Prestadores => Set<Prestador>();
    public DbSet<Telefone> Telefones => Set<Telefone>();
    public DbSet<Estado> Estados => Set<Estado>();
    public DbSet<Cidade> Cidades => Set<Cidade>();
    public DbSet<Endereco> Enderecos => Set<Endereco>();
    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Portfolio> Portfolios => Set<Portfolio>();
    public DbSet<PortfolioImagem> PortfolioImagens => Set<PortfolioImagem>();
    public DbSet<Favorito> Favoritos => Set<Favorito>();
    public DbSet<Avaliacao> Avaliacoes => Set<Avaliacao>();
    public DbSet<Solicitacao> Solicitacoes => Set<Solicitacao>();
    public DbSet<SolicitacaoImagem> SolicitacaoImagens => Set<SolicitacaoImagem>();
    public DbSet<Proposta> Propostas => Set<Proposta>();
    public DbSet<PropostaItem> PropostaItens => Set<PropostaItem>();
    public DbSet<Pedido> Pedidos => Set<Pedido>();
    public DbSet<Conversa> Conversas => Set<Conversa>();
    public DbSet<Mensagem> Mensagens => Set<Mensagem>();
    public DbSet<MensagemAnexo> MensagemAnexos => Set<MensagemAnexo>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permissao> Permissoes => Set<Permissao>();
    public DbSet<UsuarioRole> UsuarioRoles => Set<UsuarioRole>();
    public DbSet<RolePermissao> RolePermissoes => Set<RolePermissao>();
    public DbSet<Denuncia> Denuncias => Set<Denuncia>();
    public DbSet<DocumentoPrestador> DocumentosPrestadores => Set<DocumentoPrestador>();
    public DbSet<DocumentoCliente> DocumentosClientes => Set<DocumentoCliente>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 0. Registro de Enums nativos do PostgreSQL
        var nullTranslator = new NpgsqlNullNameTranslator();
        modelBuilder.HasPostgresEnum<StatusDisponibilidade>(name: "status_disponibilidade", nameTranslator: nullTranslator);
        modelBuilder.HasPostgresEnum<StatusSolicitacao>(name: "status_solicitacao", nameTranslator: nullTranslator);
        modelBuilder.HasPostgresEnum<StatusProposta>(name: "status_proposta", nameTranslator: nullTranslator);
        modelBuilder.HasPostgresEnum<StatusPedido>(name: "status_pedido", nameTranslator: nullTranslator);
        modelBuilder.HasPostgresEnum<TipoMensagem>(name: "tipo_mensagem", nameTranslator: nullTranslator);
        modelBuilder.HasPostgresEnum<StatusVerificacao>(name: "status_verificacao", nameTranslator: nullTranslator);
        modelBuilder.HasPostgresEnum<StatusConta>(name: "status_conta", nameTranslator: nullTranslator);
        modelBuilder.HasPostgresEnum<StatusDocumento>(name: "status_documento", nameTranslator: nullTranslator);
        modelBuilder.HasPostgresEnum<TipoDenuncia>(name: "tipo_denuncia", nameTranslator: nullTranslator);
        modelBuilder.HasPostgresEnum<StatusDenuncia>(name: "status_denuncia", nameTranslator: nullTranslator);

        // Mapeamento: usuarios
        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.ToTable("usuarios");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nome).HasColumnName("nome").HasMaxLength(150).IsRequired();
            entity.Property(e => e.Email).HasColumnName("email").HasMaxLength(100).IsRequired();
            entity.Property(e => e.SenhaHash).HasColumnName("senha_hash").HasMaxLength(255).IsRequired();
            entity.Property(e => e.Perfil).HasColumnName("perfil").HasMaxLength(20);
            entity.Property(e => e.Ativo).HasColumnName("ativo");
            entity.Property(e => e.Documento).HasColumnName("documento").HasMaxLength(20);
            entity.Property(e => e.Verificado).HasColumnName("verificado");
            entity.Property(e => e.FotoPerfilUrl).HasColumnName("foto_perfil_url").HasMaxLength(255);
            entity.Property(e => e.MediaAvaliacao).HasColumnName("media_avaliacao").HasPrecision(3, 2);
            entity.Property(e => e.TotalAvaliacoes).HasColumnName("total_avaliacoes");
            entity.Property(e => e.TermosAceitosEm).HasColumnName("termos_aceitos_em");
            entity.Property(e => e.StatusVerificacao).HasColumnName("status_verificacao").HasColumnType("status_verificacao");
            entity.Property(e => e.StatusConta).HasColumnName("status_conta").HasColumnType("status_conta");
            entity.Property(e => e.UltimoAcessoEm).HasColumnName("ultimo_acesso_em");
            entity.Property(e => e.CriadoEm).HasColumnName("criado_em");
            entity.Property(e => e.AtualizadoEm).HasColumnName("atualizado_em");

            entity.HasIndex(e => e.Email).IsUnique();

            entity.HasOne(e => e.Cliente)
                .WithOne(c => c.Usuario)
                .HasForeignKey<Cliente>(c => c.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Prestador)
                .WithOne(p => p.Usuario)
                .HasForeignKey<Prestador>(p => p.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Mapeamento: cliente
        modelBuilder.Entity<Cliente>(entity =>
        {
            entity.ToTable("cliente");
            entity.HasKey(e => e.UsuarioId);
            entity.Property(e => e.UsuarioId).HasColumnName("usuario_id");
            entity.Property(e => e.Ativo).HasColumnName("ativo");
            entity.Property(e => e.CriadoEm).HasColumnName("criado_em");
            entity.Property(e => e.AtualizadoEm).HasColumnName("atualizado_em");
        });

        // Mapeamento: prestador
        modelBuilder.Entity<Prestador>(entity =>
        {
            entity.ToTable("prestador");
            entity.HasKey(e => e.UsuarioId);
            entity.Property(e => e.UsuarioId).HasColumnName("usuario_id");
            entity.Property(e => e.NomeFantasia).HasColumnName("nome_fantasia").HasMaxLength(150);
            entity.Property(e => e.Bio).HasColumnName("bio");
            entity.Property(e => e.ExperienciaAnos).HasColumnName("experiencia_anos");
            entity.Property(e => e.ValorHoraInicial).HasColumnName("valor_hora_inicial").HasPrecision(10, 2);
            entity.Property(e => e.CapaUrl).HasColumnName("capa_url").HasMaxLength(500);
            entity.Property(e => e.Latitude).HasColumnName("latitude").HasPrecision(10, 8);
            entity.Property(e => e.Longitude).HasColumnName("longitude").HasPrecision(11, 8);
            entity.Property(e => e.RaioAtendimentoKm).HasColumnName("raio_atendimento_km");
            entity.Property(e => e.StatusDisponibilidade).HasColumnName("status_disponibilidade").HasColumnType("status_disponibilidade");
            entity.Property(e => e.PlanoAssinatura).HasColumnName("plano_assinatura");
            entity.Property(e => e.DestaqueRegiao).HasColumnName("destaque_regiao");
            entity.Property(e => e.SeloSuperprestador).HasColumnName("selo_superprestador");
            entity.Property(e => e.TempoMedioRespostaMinutos).HasColumnName("tempo_medio_resposta_minutos");
            entity.Property(e => e.CriadoEm).HasColumnName("criado_em");
            entity.Property(e => e.AtualizadoEm).HasColumnName("atualizado_em");
        });

        // Mapeamento: estados
        modelBuilder.Entity<Estado>(entity =>
        {
            entity.ToTable("estados");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Sigla).HasColumnName("sigla").HasMaxLength(2).IsRequired();
            entity.Property(e => e.Nome).HasColumnName("nome").HasMaxLength(50).IsRequired();

            entity.HasIndex(e => e.Sigla).IsUnique();
        });

        // Mapeamento: cidades
        modelBuilder.Entity<Cidade>(entity =>
        {
            entity.ToTable("cidades");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.EstadoId).HasColumnName("estado_id");
            entity.Property(e => e.Nome).HasColumnName("nome").HasMaxLength(100).IsRequired();

            entity.HasOne(e => e.Estado)
                .WithMany(est => est.Cidades)
                .HasForeignKey(e => e.EstadoId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Mapeamento: enderecos
        modelBuilder.Entity<Endereco>(entity =>
        {
            entity.ToTable("enderecos");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UsuarioId).HasColumnName("usuario_id");
            entity.Property(e => e.CidadeId).HasColumnName("cidade_id");
            entity.Property(e => e.Bairro).HasColumnName("bairro").HasMaxLength(100);
            entity.Property(e => e.Cep).HasColumnName("cep").HasMaxLength(20);
            entity.Property(e => e.Latitude).HasColumnName("latitude").HasPrecision(9, 6);
            entity.Property(e => e.Longitude).HasColumnName("longitude").HasPrecision(9, 6);
            entity.Property(e => e.Principal).HasColumnName("principal");
            entity.Property(e => e.Apelido).HasColumnName("apelido").HasMaxLength(50);
            entity.Property(e => e.Logradouro).HasColumnName("logradouro").HasMaxLength(200);
            entity.Property(e => e.Numero).HasColumnName("numero").HasMaxLength(20);
            entity.Property(e => e.Complemento).HasColumnName("complemento").HasMaxLength(100);
            entity.Property(e => e.CidadeNome).HasColumnName("cidade").HasMaxLength(100);
            entity.Property(e => e.EstadoSigla).HasColumnName("estado").HasMaxLength(2);
            entity.Property(e => e.CriadoEm).HasColumnName("criado_em");
            entity.Property(e => e.AtualizadoEm).HasColumnName("atualizado_em");

            entity.HasOne(e => e.Usuario)
                .WithMany(u => u.Enderecos)
                .HasForeignKey(e => e.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Cidade)
                .WithMany(c => c.Enderecos)
                .HasForeignKey(e => e.CidadeId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Mapeamento: telefones
        modelBuilder.Entity<Telefone>(entity =>
        {
            entity.ToTable("telefones");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UsuarioId).HasColumnName("usuario_id");
            entity.Property(e => e.Numero).HasColumnName("numero").HasMaxLength(20).IsRequired();
            entity.Property(e => e.Principal).HasColumnName("principal");
            entity.Property(e => e.Tipo).HasColumnName("tipo").HasMaxLength(20);
            entity.Property(e => e.CriadoEm).HasColumnName("criado_em");

            entity.HasOne(e => e.Usuario)
                .WithMany(u => u.Telefones)
                .HasForeignKey(e => e.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);
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
            entity.Ignore(e => e.AtribuidoEm);

            entity.HasOne(e => e.Role)
                .WithMany(r => r.RolePermissoes)
                .HasForeignKey(e => e.RoleId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Permissao)
                .WithMany(p => p.RolePermissoes)
                .HasForeignKey(e => e.PermissaoId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Mapeamento: categorias
        modelBuilder.Entity<Categoria>(entity =>
        {
            entity.ToTable("categorias");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nome).HasColumnName("nome").HasMaxLength(100).IsRequired();
            entity.Property(e => e.Slug).HasColumnName("slug").HasMaxLength(100).IsRequired();
            entity.Property(e => e.Descricao).HasColumnName("descricao");
            entity.Property(e => e.IconeUrl).HasColumnName("icone_url").HasMaxLength(255);
            entity.Property(e => e.Ativo).HasColumnName("ativo");
            entity.Property(e => e.CriadoEm).HasColumnName("criado_em");
            entity.Property(e => e.AtualizadoEm).HasColumnName("atualizado_em");

            entity.HasIndex(e => e.Slug).IsUnique();
        });

        // Mapeamento: portfolios
        modelBuilder.Entity<Portfolio>(entity =>
        {
            entity.ToTable("portfolios");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PrestadorId).HasColumnName("prestador_id");
            entity.Property(e => e.Titulo).HasColumnName("titulo").HasMaxLength(200);
            entity.Property(e => e.Descricao).HasColumnName("descricao");
            entity.Property(e => e.Destaque).HasColumnName("destaque");
            entity.Property(e => e.TotalVisualizacoes).HasColumnName("total_visualizacoes");
            entity.Property(e => e.CriadoEm).HasColumnName("criado_em");
            entity.Property(e => e.AtualizadoEm).HasColumnName("atualizado_em");

            entity.HasOne(e => e.Prestador)
                .WithMany()
                .HasForeignKey(e => e.PrestadorId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Mapeamento: portfolio_imagens
        modelBuilder.Entity<PortfolioImagem>(entity =>
        {
            entity.ToTable("portfolio_imagens");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PortfolioId).HasColumnName("portfolio_id");
            entity.Property(e => e.ImagemUrl).HasColumnName("imagem_url").HasMaxLength(500).IsRequired();
            entity.Property(e => e.Ordem).HasColumnName("ordem");
            entity.Property(e => e.CriadoEm).HasColumnName("criado_em");

            entity.HasOne(e => e.Portfolio)
                .WithMany(p => p.Imagens)
                .HasForeignKey(e => e.PortfolioId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Mapeamento: favoritos
        modelBuilder.Entity<Favorito>(entity =>
        {
            entity.ToTable("favoritos");
            entity.HasKey(e => new { e.ClienteId, e.PrestadorId });
            entity.Property(e => e.ClienteId).HasColumnName("cliente_id");
            entity.Property(e => e.PrestadorId).HasColumnName("prestador_id");
            entity.Property(e => e.CriadoEm).HasColumnName("criado_em");

            entity.HasOne(e => e.Cliente)
                .WithMany()
                .HasForeignKey(e => e.ClienteId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Prestador)
                .WithMany()
                .HasForeignKey(e => e.PrestadorId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Mapeamento: avaliacoes
        modelBuilder.Entity<Avaliacao>(entity =>
        {
            entity.ToTable("avaliacoes");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PedidoId).HasColumnName("pedido_id");
            entity.Property(e => e.ClienteId).HasColumnName("cliente_id");
            entity.Property(e => e.PrestadorId).HasColumnName("prestador_id");
            entity.Property(e => e.Nota).HasColumnName("nota").IsRequired();
            entity.Property(e => e.Comentario).HasColumnName("comentario");
            entity.Property(e => e.DataCriacao).HasColumnName("data_criacao");
            entity.Property(e => e.AtualizadoEm).HasColumnName("atualizado_em");

            entity.HasIndex(e => e.PedidoId).IsUnique();

            entity.HasOne(e => e.Cliente)
                .WithMany()
                .HasForeignKey(e => e.ClienteId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Prestador)
                .WithMany()
                .HasForeignKey(e => e.PrestadorId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Mapeamento: solicitacoes
        modelBuilder.Entity<Solicitacao>(entity =>
        {
            entity.ToTable("solicitacoes");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ClienteId).HasColumnName("cliente_id");
            entity.Property(e => e.PrestadorId).HasColumnName("prestador_id");
            entity.Property(e => e.CategoriaId).HasColumnName("categoria_id");
            entity.Property(e => e.EnderecoId).HasColumnName("endereco_id");
            entity.Property(e => e.EnderecoAtendimento).HasColumnName("endereco_atendimento");
            entity.Property(e => e.Titulo).HasColumnName("titulo").HasMaxLength(255).IsRequired();
            entity.Property(e => e.Descricao).HasColumnName("descricao").IsRequired();
            entity.Property(e => e.Status).HasColumnName("status").HasColumnType("status_solicitacao");
            entity.Property(e => e.Latitude).HasColumnName("latitude").HasPrecision(10, 8);
            entity.Property(e => e.Longitude).HasColumnName("longitude").HasPrecision(11, 8);
            entity.Property(e => e.CriadoEm).HasColumnName("criado_em");
            entity.Property(e => e.AtualizadoEm).HasColumnName("atualizado_em");

            entity.HasOne(e => e.Cliente)
                .WithMany()
                .HasForeignKey(e => e.ClienteId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Prestador)
                .WithMany()
                .HasForeignKey(e => e.PrestadorId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Categoria)
                .WithMany()
                .HasForeignKey(e => e.CategoriaId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Endereco)
                .WithMany()
                .HasForeignKey(e => e.EnderecoId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Mapeamento: solicitacao_imagens
        modelBuilder.Entity<SolicitacaoImagem>(entity =>
        {
            entity.ToTable("solicitacao_imagens");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.SolicitacaoId).HasColumnName("solicitacao_id");
            entity.Property(e => e.ImagemUrl).HasColumnName("imagem_url").HasMaxLength(500).IsRequired();
            entity.Property(e => e.CriadoEm).HasColumnName("criado_em");

            entity.HasOne(e => e.Solicitacao)
                .WithMany(s => s.Imagens)
                .HasForeignKey(e => e.SolicitacaoId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Mapeamento: propostas
        modelBuilder.Entity<Proposta>(entity =>
        {
            entity.ToTable("propostas");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.SolicitacaoId).HasColumnName("solicitacao_id");
            entity.Property(e => e.PrestadorId).HasColumnName("prestador_id");
            entity.Property(e => e.ValorTotal).HasColumnName("valor_total").HasPrecision(10, 2).IsRequired();
            entity.Property(e => e.PrazoDias).HasColumnName("prazo_dias");
            entity.Property(e => e.Descricao).HasColumnName("descricao");
            entity.Property(e => e.Status).HasColumnName("status").HasColumnType("status_proposta");
            entity.Property(e => e.CriadoEm).HasColumnName("criado_em");
            entity.Property(e => e.AtualizadoEm).HasColumnName("atualizado_em");

            entity.HasOne(e => e.Solicitacao)
                .WithMany(s => s.Propostas)
                .HasForeignKey(e => e.SolicitacaoId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Prestador)
                .WithMany()
                .HasForeignKey(e => e.PrestadorId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Mapeamento: proposta_itens
        modelBuilder.Entity<PropostaItem>(entity =>
        {
            entity.ToTable("proposta_itens");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PropostaId).HasColumnName("proposta_id");
            entity.Property(e => e.Descricao).HasColumnName("descricao").HasMaxLength(255);
            entity.Property(e => e.Valor).HasColumnName("valor").HasPrecision(10, 2);
            entity.Property(e => e.Quantidade).HasColumnName("quantidade");

            entity.HasOne(e => e.Proposta)
                .WithMany(p => p.Itens)
                .HasForeignKey(e => e.PropostaId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Mapeamento: pedidos
        modelBuilder.Entity<Pedido>(entity =>
        {
            entity.ToTable("pedidos");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ClienteId).HasColumnName("cliente_id");
            entity.Property(e => e.PrestadorId).HasColumnName("prestador_id");
            entity.Property(e => e.PropostaId).HasColumnName("proposta_id");
            entity.Property(e => e.EnderecoId).HasColumnName("endereco_id");
            entity.Property(e => e.EnderecoAtendimento).HasColumnName("endereco_atendimento");
            entity.Property(e => e.DescricaoNecessidade).HasColumnName("descricao_necessidade").IsRequired();
            entity.Property(e => e.Status).HasColumnName("status").HasColumnType("status_pedido");
            entity.Property(e => e.ValorCombinado).HasColumnName("valor_combinado").HasPrecision(10, 2);
            entity.Property(e => e.ValorFinal).HasColumnName("valor_final").HasPrecision(10, 2);
            entity.Property(e => e.DataSolicitacao).HasColumnName("data_solicitacao");
            entity.Property(e => e.DataConclusao).HasColumnName("data_conclusao");
            entity.Property(e => e.AgendadoPara).HasColumnName("agendado_para");
            entity.Property(e => e.IniciadoEm).HasColumnName("iniciado_em");
            entity.Property(e => e.ConcluidoEm).HasColumnName("concluido_em");
            entity.Property(e => e.CriadoEm).HasColumnName("criado_em");
            entity.Property(e => e.AtualizadoEm).HasColumnName("atualizado_em");

            entity.HasOne(e => e.Cliente)
                .WithMany()
                .HasForeignKey(e => e.ClienteId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Prestador)
                .WithMany()
                .HasForeignKey(e => e.PrestadorId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Proposta)
                .WithMany()
                .HasForeignKey(e => e.PropostaId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Endereco)
                .WithMany()
                .HasForeignKey(e => e.EnderecoId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Avaliacao)
                .WithOne()
                .HasForeignKey<Avaliacao>(a => a.PedidoId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Mapeamento: conversas
        modelBuilder.Entity<Conversa>(entity =>
        {
            entity.ToTable("conversas");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PedidoId).HasColumnName("pedido_id");
            entity.Property(e => e.ClienteId).HasColumnName("cliente_id");
            entity.Property(e => e.PrestadorId).HasColumnName("prestador_id");
            entity.Property(e => e.CriadoEm).HasColumnName("criado_em");
            entity.Property(e => e.AtualizadoEm).HasColumnName("atualizado_em");

            entity.HasOne(e => e.Cliente)
                .WithMany()
                .HasForeignKey(e => e.ClienteId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Prestador)
                .WithMany()
                .HasForeignKey(e => e.PrestadorId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Pedido)
                .WithMany()
                .HasForeignKey(e => e.PedidoId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Mapeamento: mensagens
        modelBuilder.Entity<Mensagem>(entity =>
        {
            entity.ToTable("mensagens");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ConversaId).HasColumnName("conversa_id");
            entity.Property(e => e.RemetenteId).HasColumnName("remetente_id");
            entity.Property(e => e.Tipo).HasColumnName("tipo").HasColumnType("tipo_mensagem");
            entity.Property(e => e.Conteudo).HasColumnName("conteudo");
            entity.Property(e => e.Lida).HasColumnName("lida");
            entity.Property(e => e.LidaEm).HasColumnName("lida_em");
            entity.Property(e => e.EnviadoEm).HasColumnName("enviado_em");

            entity.HasOne(e => e.Conversa)
                .WithMany(c => c.Mensagens)
                .HasForeignKey(e => e.ConversaId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Remetente)
                .WithMany()
                .HasForeignKey(e => e.RemetenteId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Mapeamento: mensagem_anexos
        modelBuilder.Entity<MensagemAnexo>(entity =>
        {
            entity.ToTable("mensagem_anexos");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.MensagemId).HasColumnName("mensagem_id");
            entity.Property(e => e.ArquivoUrl).HasColumnName("arquivo_url").HasMaxLength(500);
            entity.Property(e => e.TipoArquivo).HasColumnName("tipo_arquivo").HasMaxLength(30);
            entity.Property(e => e.TamanhoBytes).HasColumnName("tamanho_bytes");

            entity.HasOne(e => e.Mensagem)
                .WithMany(m => m.Anexos)
                .HasForeignKey(e => e.MensagemId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Mapeamento: denuncias
        modelBuilder.Entity<Denuncia>(entity =>
        {
            entity.ToTable("denuncias");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UsuarioDenuncianteId).HasColumnName("usuario_denunciante_id");
            entity.Property(e => e.UsuarioDenunciadoId).HasColumnName("usuario_denunciado_id");
            entity.Property(e => e.TipoDenuncia).HasColumnName("tipo_denuncia").HasColumnType("tipo_denuncia");
            entity.Property(e => e.Motivo).HasColumnName("motivo");
            entity.Property(e => e.Descricao).HasColumnName("descricao");
            entity.Property(e => e.Status).HasColumnName("status").HasColumnType("status_denuncia");
            entity.Property(e => e.AnalisadoPor).HasColumnName("analisado_por");
            entity.Property(e => e.Resultado).HasColumnName("resultado");
            entity.Property(e => e.CriadoEm).HasColumnName("criado_em");
            entity.Property(e => e.AnalisadoEm).HasColumnName("analisado_em");

            entity.HasOne(e => e.UsuarioDenunciante)
                .WithMany()
                .HasForeignKey(e => e.UsuarioDenuncianteId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.UsuarioDenunciado)
                .WithMany()
                .HasForeignKey(e => e.UsuarioDenunciadoId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Mapeamento: documentos_prestador
        modelBuilder.Entity<DocumentoPrestador>(entity =>
        {
            entity.ToTable("documentos_prestador");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PrestadorId).HasColumnName("prestador_id");
            entity.Property(e => e.TipoDocumento).HasColumnName("tipo_documento").HasMaxLength(50);
            entity.Property(e => e.ArquivoUrl).HasColumnName("arquivo_url").HasMaxLength(500);
            entity.Property(e => e.Status).HasColumnName("status").HasColumnType("status_documento");
            entity.Property(e => e.MotivoRejeicao).HasColumnName("motivo_rejeicao");
            entity.Property(e => e.SubmetidoEm).HasColumnName("submetido_em");
            entity.Property(e => e.AnalisadoEm).HasColumnName("analisado_em");
            entity.Property(e => e.AnalisadoPor).HasColumnName("analisado_por");

            entity.HasOne(e => e.Prestador)
                .WithMany()
                .HasForeignKey(e => e.PrestadorId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Mapeamento: documentos_cliente
        modelBuilder.Entity<DocumentoCliente>(entity =>
        {
            entity.ToTable("documentos_cliente");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ClienteId).HasColumnName("cliente_id");
            entity.Property(e => e.TipoDocumento).HasColumnName("tipo_documento").HasMaxLength(50);
            entity.Property(e => e.ArquivoUrl).HasColumnName("arquivo_url").HasMaxLength(500);
            entity.Property(e => e.Status).HasColumnName("status").HasColumnType("status_documento");
            entity.Property(e => e.MotivoRejeicao).HasColumnName("motivo_rejeicao");
            entity.Property(e => e.SubmetidoEm).HasColumnName("submetido_em");
            entity.Property(e => e.AnalisadoEm).HasColumnName("analisado_em");
            entity.Property(e => e.AnalisadoPor).HasColumnName("analisado_por");

            entity.HasOne(e => e.Cliente)
                .WithMany()
                .HasForeignKey(e => e.ClienteId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Mapeamento: audit_log
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("audit_log");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UsuarioId).HasColumnName("usuario_id");
            entity.Property(e => e.TabelaAfetada).HasColumnName("tabela_afetada").HasMaxLength(100);
            entity.Property(e => e.IdRegistro).HasColumnName("id_registro");
            entity.Property(e => e.Acao).HasColumnName("acao").HasMaxLength(50);
            entity.Property(e => e.DadosAntes).HasColumnName("dados_antes").HasColumnType("jsonb");
            entity.Property(e => e.DadosDepois).HasColumnName("dados_depois").HasColumnType("jsonb");
            entity.Property(e => e.IpAddress).HasColumnName("ip_address").HasMaxLength(45);
            entity.Property(e => e.UserAgent).HasColumnName("user_agent");
            entity.Property(e => e.CriadoEm).HasColumnName("criado_em");
        });
    }
}
