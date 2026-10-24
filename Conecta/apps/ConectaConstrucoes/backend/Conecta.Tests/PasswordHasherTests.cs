using Conecta.Application.Servicos.Seguranca;

namespace Conecta.Tests;

public class PasswordHasherTests
{
    private readonly PasswordHasher _hasher = new();

    [Fact]
    public void Hash_DeveGerarHashDiferenteDoTextoClaro()
    {
        var senha = "MinhaSenhaForte@2026";
        var hash = _hasher.Hash(senha);

        Assert.NotNull(hash);
        Assert.NotEqual(senha, hash);
    }

    [Fact]
    public void Verify_ComSenhaCorreta_DeveRetornarTrue()
    {
        var senha = "MinhaSenhaForte@2026";
        var hash = _hasher.Hash(senha);

        var resultado = _hasher.Verify(senha, hash);
        Assert.True(resultado);
    }

    [Fact]
    public void Verify_ComSenhaIncorreta_DeveRetornarFalse()
    {
        var senha = "MinhaSenhaForte@2026";
        var hash = _hasher.Hash(senha);

        var resultado = _hasher.Verify("SenhaErrada", hash);
        Assert.False(resultado);
    }
}
