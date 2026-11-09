using Conecta.Domain.Enums;
using Conecta.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Npgsql;
using Npgsql.NameTranslation;
using Xunit;

namespace Conecta.Tests;

public class DebugTranslator : INpgsqlNameTranslator
{
    public static List<string> Calls = new();
    public string TranslateTypeName(string clrName) => clrName;
    public string TranslateMemberName(string clrName)
    {
        Calls.Add($"Member:{clrName}");
        return clrName;
    }
}

public class EnumMappingTests
{
    [Fact]
    public void TestarTraducaoDeNomesNpgsql()
    {
        var snakeTranslator = new NpgsqlSnakeCaseNameTranslator();
        var nullTranslator = new NpgsqlNullNameTranslator();

        var memberSnake = snakeTranslator.TranslateMemberName("ATIVA");
        var memberNull = nullTranslator.TranslateMemberName("ATIVA");

        Assert.Equal("ativa", memberSnake);
        Assert.Equal("ATIVA", memberNull);
    }

    [Fact]
    public void TestarModelBuilderComDataSource()
    {
        var builder = new NpgsqlDataSourceBuilder("Host=localhost;Database=test;Username=test;Password=test");
        var nullTranslator = new NpgsqlNullNameTranslator();
        builder.MapEnum<StatusConta>("status_conta", nullTranslator);
        builder.MapEnum<StatusVerificacao>("status_verificacao", nullTranslator);
        using var dataSource = builder.Build();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(dataSource)
            .Options;

        using var context = new AppDbContext(options);
        var model = context.Model;

        var usuarioEntity = model.FindEntityType(typeof(Conecta.Domain.Entidades.Usuario));
        var statusContaProp = usuarioEntity?.FindProperty("StatusConta");
        var statusVerificacaoProp = usuarioEntity?.FindProperty("StatusVerificacao");

        Assert.NotNull(statusContaProp);
        Assert.NotNull(statusVerificacaoProp);
        // O mapeamento nativo Npgsql usa o tipo Enum direto, sem ValueConverter artificial
        Assert.Null(statusContaProp.GetValueConverter());
        Assert.Null(statusVerificacaoProp.GetValueConverter());
        Assert.Equal(typeof(StatusConta), statusContaProp.ClrType);
        Assert.Equal(typeof(StatusVerificacao), statusVerificacaoProp.ClrType);

        // Diagnostico do tipo de coluna e type mapping
        Assert.Equal("status_conta", statusContaProp.GetColumnType());
        Assert.Equal("status_verificacao", statusVerificacaoProp.GetColumnType());

        var prestadorEntity = model.FindEntityType(typeof(Conecta.Domain.Entidades.Prestador));
        Assert.Equal("status_disponibilidade", prestadorEntity?.FindProperty("StatusDisponibilidade")?.GetColumnType());

        var solicitacaoEntity = model.FindEntityType(typeof(Conecta.Domain.Entidades.Solicitacao));
        Assert.Equal("status_solicitacao", solicitacaoEntity?.FindProperty("Status")?.GetColumnType());

        var propostaEntity = model.FindEntityType(typeof(Conecta.Domain.Entidades.Proposta));
        Assert.Equal("status_proposta", propostaEntity?.FindProperty("Status")?.GetColumnType());

        var pedidoEntity = model.FindEntityType(typeof(Conecta.Domain.Entidades.Pedido));
        Assert.Equal("status_pedido", pedidoEntity?.FindProperty("Status")?.GetColumnType());

        var mensagemEntity = model.FindEntityType(typeof(Conecta.Domain.Entidades.Mensagem));
        Assert.Equal("tipo_mensagem", mensagemEntity?.FindProperty("Tipo")?.GetColumnType());

        var denunciaEntity = model.FindEntityType(typeof(Conecta.Domain.Entidades.Denuncia));
        Assert.Equal("tipo_denuncia", denunciaEntity?.FindProperty("TipoDenuncia")?.GetColumnType());
        Assert.Equal("status_denuncia", denunciaEntity?.FindProperty("Status")?.GetColumnType());

        var docPrestadorEntity = model.FindEntityType(typeof(Conecta.Domain.Entidades.DocumentoPrestador));
        Assert.Equal("status_documento", docPrestadorEntity?.FindProperty("Status")?.GetColumnType());

        var docClienteEntity = model.FindEntityType(typeof(Conecta.Domain.Entidades.DocumentoCliente));
        Assert.Equal("status_documento", docClienteEntity?.FindProperty("Status")?.GetColumnType());
    }

    [Fact]
    public async Task TestarQueryRealUsuario()
    {
        var connectionString = "Host=localhost;Port=5432;Database=monorepo_db;Username=admin;Password=admin123";
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
        await using var dataSource = dataSourceBuilder.Build();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(dataSource, o =>
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
            })
            .Options;

        await using var context = new AppDbContext(options);

        var admin = await context.Usuarios.FirstOrDefaultAsync(u => u.Email == "admin@conecta.com");
        Assert.NotNull(admin);
        Assert.Equal(StatusConta.ATIVA, admin.StatusConta);
        Assert.Equal(StatusVerificacao.COMPLETO, admin.StatusVerificacao);

        var prestador = await context.Prestadores.Include(p => p.Usuario).FirstOrDefaultAsync(p => p.UsuarioId == 7);
        Assert.NotNull(prestador);
        Assert.Equal(StatusDisponibilidade.DISPONIVEL, prestador.StatusDisponibilidade);
        Assert.Equal("Carlos Instalações Elétricas", prestador.NomeFantasia);
    }
}
