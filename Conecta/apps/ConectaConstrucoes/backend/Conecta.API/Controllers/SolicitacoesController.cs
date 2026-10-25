using System.Security.Claims;
using Conecta.Application.DTOs;
using Conecta.Application.Servicos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Conecta.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Route("api/[controller]")]
[Produces("application/json")]
public class SolicitacoesController : ControllerBase
{
    private readonly ISolicitacaoService _solicitacaoService;

    public SolicitacoesController(ISolicitacaoService solicitacaoService)
    {
        _solicitacaoService = solicitacaoService;
    }

    /// <summary>
    /// Registra uma nova solicitação de orçamento (Requisito CON_016 - Status inicial: ABERTA).
    /// </summary>
    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(SolicitacaoResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Criar([FromBody] CriarSolicitacaoRequest request)
    {
        var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(claimId, out var clienteId))
        {
            return Unauthorized(new { mensagem = "Usuário não autenticado." });
        }

        try
        {
            var resultado = await _solicitacaoService.CriarAsync(clienteId, request);
            return CreatedAtAction(nameof(ObterPorId), new { id = resultado.Id }, resultado);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }

    /// <summary>
    /// Obtém detalhes de uma solicitação de serviço pelo ID.
    /// </summary>
    [HttpGet("{id:int}")]
    [Authorize]
    [ProducesResponseType(typeof(SolicitacaoResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObterPorId(int id)
    {
        var s = await _solicitacaoService.ObterPorIdAsync(id);
        if (s == null)
            return NotFound(new { mensagem = $"Solicitação #{id} não encontrada." });

        return Ok(s);
    }
}
