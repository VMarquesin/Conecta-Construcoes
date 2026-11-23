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
            return StatusCode(StatusCodes.Status403Forbidden, new { mensagem = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(StatusCodes.Status409Conflict, new { mensagem = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }

    /// <summary>
    /// Edita uma avaliação existente. Permitido apenas dentro do prazo de 1 hora da criação pelo autor.
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize]
    [ProducesResponseType(typeof(AvaliacaoResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AtualizarAvaliacao(int id, [FromBody] AtualizarAvaliacaoRequest request)
    {
        var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(usuarioIdClaim, out var clienteId))
            return Unauthorized(new { mensagem = "Usuário não autenticado." });

        try
        {
            var response = await _avaliacaoService.AtualizarAvaliacaoAsync(id, clienteId, request);
            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { mensagem = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }

    /// <summary>
    /// Remove uma avaliação existente. Permitido apenas dentro do prazo de 1 hora da criação pelo autor.
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoverAvaliacao(int id)
    {
        var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(usuarioIdClaim, out var clienteId))
            return Unauthorized(new { mensagem = "Usuário não autenticado." });

        try
        {
            await _avaliacaoService.RemoverAvaliacaoAsync(id, clienteId);
            return Ok(new { mensagem = "Avaliação excluída com sucesso." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { mensagem = ex.Message });
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
