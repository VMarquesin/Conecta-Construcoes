using Conecta.API.Controllers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.Swagger;
using Xunit;

namespace Conecta.Tests;

public class SwaggerGenTests
{
    [Fact]
    public void TestarGeracaoDoSwaggerDocV1SemExcecoes()
    {
        var services = new ServiceCollection();

        var mockEnv = new Moq.Mock<IWebHostEnvironment>();
        mockEnv.Setup(m => m.ApplicationName).Returns("Conecta.API");
        mockEnv.Setup(m => m.EnvironmentName).Returns("Development");
        services.AddSingleton(mockEnv.Object);
        services.AddSingleton<Microsoft.Extensions.Hosting.IHostEnvironment>(mockEnv.Object);
        services.AddLogging();
        services.AddRouting();
        services.AddControllers()
            .AddApplicationPart(typeof(PortfolioController).Assembly)
            .AddControllersAsServices();

        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Conecta Construções API",
                Version = "v1"
            });
        });

        var sp = services.BuildServiceProvider();
        var swaggerProvider = sp.GetRequiredService<ISwaggerProvider>();

        // Deve gerar a especificação sem lançar SwaggerGeneratorException
        var doc = swaggerProvider.GetSwagger("v1");

        Assert.NotNull(doc);
        Assert.NotNull(doc.Paths);
        Assert.True(
            doc.Paths.ContainsKey("/api/v1/Portfolio/upload") || doc.Paths.ContainsKey("/api/Portfolio/upload"),
            "O endpoint de upload do Portfolio deve estar mapeado no Swagger."
        );
    }
}
