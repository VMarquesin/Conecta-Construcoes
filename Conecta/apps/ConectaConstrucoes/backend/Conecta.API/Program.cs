using System.Text;
using Conecta.Application;
using Conecta.Infrastructure;
using Conecta.Infrastructure.Database;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

// 1. Configurar serviços da Camada de Infraestrutura (EF Core, Dapper e Evolve)
builder.Services.AddInfrastructure(builder.Configuration);

// 2. Configurar serviços da Camada de Aplicação (Regras de negócio, hashing, JWT e RBAC)
builder.Services.AddApplication();

// 3. Configurar Autenticação via JWT Bearer
var jwtSecret = builder.Configuration["Jwt:SecretKey"] ?? "ConectaConstrucoes_Chave_Secreta_Jwt_Segura_2026_Assinatura_Token_HMAC256!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "ConectaConstrucoes";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "ConectaApp";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// 4. Configurar Controllers
builder.Services.AddControllers();

// 5. Configurar Swagger / OpenAPI com suporte a Bearer Token (RBAC)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Conecta Construções API",
        Version = "v1",
        Description = "API do ecossistema Conecta Construções com suporte a controle de acesso baseado em papéis (RBAC), autenticação JWT e arquitetura limpa."
    });

    // Configuração do botão Authorize no Swagger UI
    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Digite 'Bearer' [espaço] e seu token JWT no campo abaixo.\n\nExemplo: Bearer eyJhbGciOiJIUzI1Ni...",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT"
    };

    c.AddSecurityDefinition("Bearer", securityScheme);

    var schemeReference = new OpenApiSecuritySchemeReference("Bearer");
    c.AddSecurityRequirement(_ => new OpenApiSecurityRequirement
    {
        {
            schemeReference,
            new List<string>()
        }
    });
});

// 6. Configurar CORS para permitir requisições do frontend
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

// 7. Executar Migrações do Banco de Dados com Evolve na inicialização
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

// 8. Pipeline HTTP: Configuração do Swagger UI
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

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
