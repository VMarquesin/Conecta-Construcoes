using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Conecta.Domain.Entidades;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Conecta.Application.Servicos.Seguranca;

public interface ITokenService
{
    string GerarToken(Usuario usuario, IEnumerable<string> roles, IEnumerable<string> permissoes);
}

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GerarToken(Usuario usuario, IEnumerable<string> roles, IEnumerable<string> permissoes)
    {
        var secretKey = _configuration["Jwt:SecretKey"] ?? "Conecta_Chave_Super_Secreta_Para_Assinatura_Jwt_Minimo_256_Bits!";
        var issuer = _configuration["Jwt:Issuer"] ?? "ConectaConstrucoes";
        var audience = _configuration["Jwt:Audience"] ?? "ConectaApp";
        var expireHours = int.TryParse(_configuration["Jwt:ExpireHours"], out var h) ? h : 24;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, usuario.Id.ToString()),
            new(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new(ClaimTypes.Name, usuario.Nome),
            new(ClaimTypes.Email, usuario.Email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        // Adiciona Roles como Claims
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        // Adiciona Permissões como Claims
        foreach (var permissao in permissoes)
        {
            claims.Add(new Claim("permission", permissao));
        }

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expireHours),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
