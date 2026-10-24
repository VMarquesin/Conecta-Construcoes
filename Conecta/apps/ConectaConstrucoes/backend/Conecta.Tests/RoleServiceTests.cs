using Conecta.Application.DTOs;
using Conecta.Application.Servicos;
using Conecta.Domain.Entidades;
using Conecta.Domain.Interfaces;
using Moq;

namespace Conecta.Tests;

public class RoleServiceTests
{
    private readonly Mock<IRoleRepository> _roleRepoMock = new();
    private readonly Mock<IPermissaoRepository> _permRepoMock = new();
    private readonly RoleService _roleService;

    public RoleServiceTests()
    {
        _roleService = new RoleService(_roleRepoMock.Object, _permRepoMock.Object);
    }

    [Fact]
    public async Task CriarAsync_QuandoNomeJaExiste_DeveLancarInvalidOperationException()
    {
        var request = new CriarRoleRequest("ADMIN_MASTER", "Admin");
        _roleRepoMock.Setup(r => r.ObterPorNomeAsync("ADMIN_MASTER"))
            .ReturnsAsync(new Role { Id = 1, Nome = "ADMIN_MASTER" });

        await Assert.ThrowsAsync<InvalidOperationException>(() => _roleService.CriarAsync(request));
    }

    [Fact]
    public async Task RemoverAsync_QuandoRoleDeSistema_DeveLancarInvalidOperationException()
    {
        _roleRepoMock.Setup(r => r.ObterPorIdAsync(1))
            .ReturnsAsync(new Role { Id = 1, Nome = "ADMIN_MASTER" });

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => _roleService.RemoverAsync(1));
        Assert.Contains("não pode ser removido", ex.Message);
    }

    [Fact]
    public async Task AssociarPermissaoAsync_ComSucesso_DeveChamarRepositorio()
    {
        _roleRepoMock.Setup(r => r.ObterPorIdAsync(1))
            .ReturnsAsync(new Role { Id = 1, Nome = "SUPORTE" });
        _permRepoMock.Setup(p => p.ObterPorIdAsync(5))
            .ReturnsAsync(new Permissao { Id = 5, Nome = "USUARIOS_VISUALIZAR" });

        await _roleService.AssociarPermissaoAsync(1, 5);

        _roleRepoMock.Verify(r => r.AdicionarPermissaoAsync(1, 5), Times.Once);
    }
}
