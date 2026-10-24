using Conecta.Application.DTOs;
using Conecta.Application.Servicos;
using Conecta.Application.Servicos.Seguranca;
using Conecta.Domain.Entidades;
using Conecta.Domain.Interfaces;
using Moq;

namespace Conecta.Tests;

public class UsuarioServiceTests
{
    private readonly Mock<IUsuarioRepository> _usuarioRepoMock = new();
    private readonly Mock<IRoleRepository> _roleRepoMock = new();
    private readonly Mock<IPasswordHasher> _hasherMock = new();
    private readonly UsuarioService _usuarioService;

    public UsuarioServiceTests()
    {
        _usuarioService = new UsuarioService(
            _usuarioRepoMock.Object,
            _roleRepoMock.Object,
            _hasherMock.Object
        );
    }

    [Fact]
    public async Task CriarAsync_QuandoEmailJaExiste_DeveLancarInvalidOperationException()
    {
        var request = new CriarUsuarioRequest("João Silva", "joao@email.com", "senha123");
        _usuarioRepoMock.Setup(r => r.ObterPorEmailAsync(It.IsAny<string>()))
            .ReturnsAsync(new Usuario { Id = 1, Email = "joao@email.com" });

        await Assert.ThrowsAsync<InvalidOperationException>(() => _usuarioService.CriarAsync(request));
    }

    [Fact]
    public async Task CriarAsync_QuandoDadosValidos_DeveCadastrarEAtribuirRolePadrao()
    {
        var request = new CriarUsuarioRequest("João Silva", "joao@email.com", "senha123", "CLIENTE");
        _usuarioRepoMock.Setup(r => r.ObterPorEmailAsync(It.IsAny<string>()))
            .ReturnsAsync((Usuario?)null);
        _hasherMock.Setup(h => h.Hash("senha123")).Returns("hash_seguro");

        _usuarioRepoMock.Setup(r => r.AdicionarAsync(It.IsAny<Usuario>()))
            .ReturnsAsync((Usuario u) => { u.Id = 10; return u; });

        var roleCliente = new Role { Id = 2, Nome = "CLIENTE" };
        _roleRepoMock.Setup(r => r.ObterPorNomeAsync("CLIENTE"))
            .ReturnsAsync(roleCliente);

        _usuarioRepoMock.Setup(r => r.ObterPorIdAsync(10))
            .ReturnsAsync(new Usuario
            {
                Id = 10,
                Nome = "João Silva",
                Email = "joao@email.com",
                Tipo = "CLIENTE",
                UsuarioRoles = new List<UsuarioRole>
                {
                    new() { UsuarioId = 10, RoleId = 2, Role = roleCliente }
                }
            });

        var resultado = await _usuarioService.CriarAsync(request);

        Assert.NotNull(resultado);
        Assert.Equal(10, resultado.Id);
        Assert.Equal("joao@email.com", resultado.Email);
        Assert.Contains("CLIENTE", resultado.Roles);
        _usuarioRepoMock.Verify(r => r.AdicionarRoleAsync(10, 2), Times.Once);
    }

    [Fact]
    public async Task AssociarRoleAsync_QuandoUsuarioNaoExiste_DeveLancarKeyNotFoundException()
    {
        _usuarioRepoMock.Setup(r => r.ObterPorIdAsync(999))
            .ReturnsAsync((Usuario?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _usuarioService.AssociarRoleAsync(999, 1));
    }

    [Fact]
    public async Task AssociarRoleAsync_QuandoRoleNaoExiste_DeveLancarKeyNotFoundException()
    {
        _usuarioRepoMock.Setup(r => r.ObterPorIdAsync(1))
            .ReturnsAsync(new Usuario { Id = 1, Nome = "Teste" });
        _roleRepoMock.Setup(r => r.ObterPorIdAsync(999))
            .ReturnsAsync((Role?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _usuarioService.AssociarRoleAsync(1, 999));
    }

    [Fact]
    public async Task AssociarRoleAsync_ComSucesso_DeveChamarRepositorio()
    {
        _usuarioRepoMock.Setup(r => r.ObterPorIdAsync(1))
            .ReturnsAsync(new Usuario { Id = 1, Nome = "Teste" });
        _roleRepoMock.Setup(r => r.ObterPorIdAsync(2))
            .ReturnsAsync(new Role { Id = 2, Nome = "ADMIN_MASTER" });

        await _usuarioService.AssociarRoleAsync(1, 2);

        _usuarioRepoMock.Verify(r => r.AdicionarRoleAsync(1, 2), Times.Once);
    }
}
