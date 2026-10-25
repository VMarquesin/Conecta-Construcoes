using System.Security.Claims;
using Conecta.Application.DTOs;
using Conecta.Application.Servicos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Conecta.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Route("api/[controller]")]
public class AvaliacoesController : ControllerBase
{
    private readonly IAvaliacaoService _avaliacaoService;

    public AvaliacoesController(IAvaliacaoService avaliacaoService)
    {
        _avaliacaoService = avaliacaoService;
    }

    /// <summary>
    /// Registra a avaliação de um serviço. Permitido apenas para pedidos com status CONCLUIDO (CON_019).
    /// </summary>
    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(AvaliacaoResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CriarAvaliacao([FromBody] CriarAvaliacaoRequest request)
    {
        var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(usuarioIdClaim, out var clienteId))
            return Unauthorized(new { mensagem = "Usuário não autenticado." });

        try
        {
            var response = await _avaliacaoService.CriarAvaliacaoAsync(clienteId, request);
            return StatusCode(StatusCodes.Status201Created, response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }

    /// <summary>
    /// Lista todas as avaliações públicas recebidas por um prestador de serviço.
    /// </summary>
    [HttpGet("prestador/{prestadorId}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<AvaliacaoResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ListarPorPrestador(int prestadorId)
    {
        var avaliacoes = await _avaliacaoService.ListarAvaliacoesDoPrestadorAsync(prestadorId);
        return Ok(avaliacoes);
    }
}
