using Conecta.Application.DTOs;
using Conecta.Application.Servicos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Conecta.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Route("api/[controller]")]
[Produces("application/json")]
public class PrestadoresController : ControllerBase
{
    private readonly IPrestadorService _prestadorService;
    private readonly IProService _proService;

    public PrestadoresController(IPrestadorService prestadorService, IProService proService)
    {
        _prestadorService = prestadorService;
        _proService = proService;
    }

    /// <summary>
    /// Realiza busca geolocalizada de prestadores de serviço por categoria, raio em KM e filtros de disponibilidade (Vitrine).
    /// </summary>
    [HttpGet("busca")]
    [HttpGet("vitrine")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PrestadorBuscaPaginadaResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Buscar([FromQuery] FiltroBuscaPrestadorRequest request)
    {
        var resultado = await _prestadorService.BuscarAsync(request);
        return Ok(resultado);
    }

    /// <summary>
    /// Obtém o perfil detalhado da vitrine de um prestador pelo ID.
    /// </summary>
    [HttpGet("{id:int}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PrestadorPerfilDetalhadoResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObterPorId(int id, [FromQuery] int? clienteId = null)
    {
        int? clienteLogadoId = null;
        var claimId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(claimId, out var parsedId))
        {
            clienteLogadoId = parsedId;
        }
        else if (clienteId.HasValue && clienteId.Value > 0)
        {
            clienteLogadoId = clienteId.Value;
        }

        var perfil = await _prestadorService.ObterPerfilDetalhadoAsync(id, clienteLogadoId);
        if (perfil == null)
            return NotFound(new { mensagem = $"Prestador com ID {id} não encontrado." });

        return Ok(perfil);
    }

    /// <summary>
    /// Alterna ou adiciona o prestador à lista de favoritos do cliente autenticado.
    /// </summary>
    [HttpPost("{id:int}/favorito")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> AlternarFavorito(int id)
    {
        var claimId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(claimId, out var clienteId))
        {
            return Unauthorized(new { mensagem = "Usuário não autenticado." });
        }

        var favoritado = await _prestadorService.AlternarFavoritoAsync(clienteId, id);
        return Ok(new { favoritado, mensagem = favoritado ? "Prestador favoritado." : "Prestador removido dos favoritos." });
    }

    /// <summary>
    /// Remove o prestador da lista de favoritos do cliente autenticado.
    /// </summary>
    [HttpDelete("{id:int}/favorito")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RemoverFavorito(int id)
    {
        var claimId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(claimId, out var clienteId))
        {
            return Unauthorized(new { mensagem = "Usuário não autenticado." });
        }

        await _prestadorService.AlternarFavoritoAsync(clienteId, id);
        return Ok(new { favoritado = false, mensagem = "Prestador removido dos favoritos." });
    }

    /// <summary>
    /// Lista o portfólio do prestador logado.
    /// </summary>
    [HttpGet("meu-portfolio")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<FotoPortfolioDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ObterMeuPortfolio([FromQuery] int? prestadorId = null)
    {
        var claimId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        int idFinal = 0;
        if (int.TryParse(claimId, out var parsedId))
            idFinal = parsedId;
        else if (prestadorId.HasValue && prestadorId.Value > 0)
            idFinal = prestadorId.Value;

        if (idFinal == 0) return Unauthorized(new { mensagem = "Prestador não autenticado." });
        var itens = await _proService.ObterPortfolioAsync(idFinal);
        return Ok(itens);
    }

    /// <summary>
    /// Adiciona um item ao portfólio do prestador logado.
    /// </summary>
    [HttpPost("portfolio")]
    [Authorize]
    [ProducesResponseType(typeof(FotoPortfolioDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> AdicionarPortfolio([FromBody] CriarItemPortfolioRequest request, [FromQuery] int? prestadorId = null)
    {
        var claimId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        int idFinal = 0;
        if (int.TryParse(claimId, out var parsedId))
            idFinal = parsedId;
        else if (prestadorId.HasValue && prestadorId.Value > 0)
            idFinal = prestadorId.Value;

        if (idFinal == 0) return Unauthorized(new { mensagem = "Prestador não autenticado." });
        var criado = await _proService.AdicionarItemPortfolioAsync(idFinal, request);
        return Ok(criado);
    }

    /// <summary>
    /// Remove um item do portfólio do prestador logado.
    /// </summary>
    [HttpDelete("portfolio/{id:int}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> RemoverPortfolio(int id, [FromQuery] int? prestadorId = null)
    {
        var claimId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        int idFinal = 0;
        if (int.TryParse(claimId, out var parsedId))
            idFinal = parsedId;
        else if (prestadorId.HasValue && prestadorId.Value > 0)
            idFinal = prestadorId.Value;

        if (idFinal == 0) return Unauthorized(new { mensagem = "Prestador não autenticado." });
        await _proService.RemoverItemPortfolioAsync(idFinal, id);
        return Ok(new { mensagem = "Item de portfólio removido com sucesso." });
    }
}
