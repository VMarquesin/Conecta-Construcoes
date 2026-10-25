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

    public PrestadoresController(IPrestadorService prestadorService)
    {
        _prestadorService = prestadorService;
    }

    /// <summary>
    /// Realiza busca geolocalizada de prestadores de serviço por categoria, raio em KM e filtros de disponibilidade.
    /// </summary>
    [HttpGet("busca")]
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
    public async Task<IActionResult> ObterPorId(int id)
    {
        int? clienteLogadoId = null;
        var claimId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(claimId, out var parsedId))
        {
            clienteLogadoId = parsedId;
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
}
