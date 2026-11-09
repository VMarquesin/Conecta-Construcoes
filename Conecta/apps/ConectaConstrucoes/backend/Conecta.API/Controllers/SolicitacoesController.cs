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
    [ProducesResponseType(typeof(SolicitacaoResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Criar([FromBody] CriarSolicitacaoRequest request, [FromQuery] int? clienteId = null)
    {
        var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        int idFinal = 0;
        if (int.TryParse(claimId, out var parsedId))
            idFinal = parsedId;
        else if (clienteId.HasValue && clienteId.Value > 0)
            idFinal = clienteId.Value;

        if (idFinal == 0)
        {
            return Unauthorized(new { mensagem = "Usuário não autenticado." });
        }

        try
        {
            var resultado = await _solicitacaoService.CriarAsync(idFinal, request);
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

    /// <summary>
    /// Envia uma proposta formal para uma solicitação de orçamento.
    /// </summary>
    [HttpPost("{id:int}/propostas")]
    [HttpPost("{id:int}/proposta")]
    [Authorize]
    [ProducesResponseType(typeof(PropostaResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> EnviarProposta(int id, [FromBody] EnviarPropostaRequest request, [FromQuery] int? prestadorId = null)
    {
        var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        int idFinal = 0;
        if (int.TryParse(claimId, out var parsedId))
            idFinal = parsedId;
        else if (prestadorId.HasValue && prestadorId.Value > 0)
            idFinal = prestadorId.Value;

        if (idFinal == 0)
        {
            return Unauthorized(new { mensagem = "Prestador não autenticado." });
        }

        try
        {
            var proposta = await _solicitacaoService.EnviarPropostaAsync(idFinal, id, request);
            return CreatedAtAction(nameof(ObterPorId), new { id }, proposta);
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
    /// Recusa uma solicitação de serviço.
    /// </summary>
    [HttpPost("{id:int}/recusar")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Recusar(int id, [FromQuery] int? prestadorId = null)
    {
        var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        int idFinal = 0;
        if (int.TryParse(claimId, out var parsedId))
            idFinal = parsedId;
        else if (prestadorId.HasValue && prestadorId.Value > 0)
            idFinal = prestadorId.Value;

        if (idFinal == 0)
        {
            return Unauthorized(new { mensagem = "Prestador não autenticado." });
        }

        try
        {
            await _solicitacaoService.RecusarSolicitacaoAsync(idFinal, id);
            return Ok(new { mensagem = $"Solicitação #{id} recusada com sucesso." });
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
}
