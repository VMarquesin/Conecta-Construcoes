using Conecta.Infrastructure;
using Conecta.Infrastructure.Database;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

// 1. Configurar serviços da Camada de Infraestrutura (EF Core, Dapper e Evolve)
builder.Services.AddInfrastructure(builder.Configuration);

// 2. Configurar Controllers
builder.Services.AddControllers();

// 3. Configurar Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Conecta Construções API",
        Version = "v1",
        Description = "API do ecossistema Conecta Construções com suporte a acesso híbrido (EF Core + Dapper) e versionamento via Evolve."
    });
});

// 4. Configurar CORS para permitir requisições do frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "http://localhost:5173",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:5173",
                "http://frontend:80",
                "http://frontend"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// 5. Executar Migrações do Banco de Dados com Evolve na inicialização
using (var scope = app.Services.CreateScope())
{
    var migrator = scope.ServiceProvider.GetRequiredService<EvolveDatabaseMigrator>();
    try
    {
        migrator.Migrate();
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning(ex, "Aviso: Não foi possível conectar ao banco para aplicar migrações na inicialização (o banco pode estar iniciando ou inacessível no ambiente local).");
    }
}

// 6. Pipeline HTTP: Configuração do Swagger UI
if (app.Environment.IsDevelopment() || true) // Disponível para visualização e testes
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Conecta API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();
