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
[Authorize]
public class ProController : ControllerBase
{
    private readonly IProService _proService;
    private readonly ISolicitacaoService _solicitacaoService;

    public ProController(IProService proService, ISolicitacaoService solicitacaoService)
    {
        _proService = proService;
        _solicitacaoService = solicitacaoService;
    }

    /// <summary>
    /// Retorna métricas, solicitações pendentes e disponibilidade do painel Conecta PRO (Requisito CON_019).
    /// </summary>
    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(ProDashboardResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> ObterDashboard()
    {
        var prestadorId = ObterUsuarioId();
        try
        {
            var dashboard = await _proService.ObterDashboardAsync(prestadorId);
            return Ok(dashboard);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
    }

    /// <summary>
    /// Alterna a disponibilidade do prestador (Disponível vs Ocupado).
    /// </summary>
    [HttpPatch("disponibilidade")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> AtualizarDisponibilidade([FromBody] AtualizarDisponibilidadeRequest request)
    {
        var prestadorId = ObterUsuarioId();
        try
        {
            await _proService.AtualizarDisponibilidadeAsync(prestadorId, request.Status);
            return Ok(new { mensagem = $"Disponibilidade alterada para {request.Status} com sucesso." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }

    /// <summary>
    /// Obtém detalhes de uma solicitação para análise pelo prestador.
    /// </summary>
    [HttpGet("solicitacoes/{id:int}")]
    [ProducesResponseType(typeof(SolicitacaoResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObterSolicitacao(int id)
    {
        var s = await _solicitacaoService.ObterPorIdAsync(id);
        if (s == null)
            return NotFound(new { mensagem = $"Solicitação #{id} não encontrada." });

        return Ok(s);
    }

    /// <summary>
    /// Envia proposta comercial formal em resposta à solicitação (Requisito CON_017 / CON_019).
    /// </summary>
    [HttpPost("solicitacoes/{id:int}/proposta")]
    [ProducesResponseType(typeof(PropostaResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> EnviarProposta(int id, [FromBody] EnviarPropostaRequest request)
    {
        var prestadorId = ObterUsuarioId();
        try
        {
            var proposta = await _solicitacaoService.EnviarPropostaAsync(prestadorId, id, request);
            return CreatedAtAction(nameof(ObterSolicitacao), new { id }, proposta);
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
    /// Recusa uma solicitação de serviço recebida.
    /// </summary>
    [HttpPost("solicitacoes/{id:int}/recusar")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> RecusarSolicitacao(int id)
    {
        var prestadorId = ObterUsuarioId();
        try
        {
            await _solicitacaoService.RecusarSolicitacaoAsync(prestadorId, id);
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

    /// <summary>
    /// Lista os itens do portfólio do prestador logado.
    /// </summary>
    [HttpGet("portfolio")]
    [ProducesResponseType(typeof(IEnumerable<FotoPortfolioDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ObterPortfolio()
    {
        var prestadorId = ObterUsuarioId();
        var portfolio = await _proService.ObterPortfolioAsync(prestadorId);
        return Ok(portfolio);
    }

    /// <summary>
    /// Adiciona uma nova foto/trabalho ao portfólio (Requisito CON_019).
    /// </summary>
    [HttpPost("portfolio")]
    [ProducesResponseType(typeof(FotoPortfolioDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> AdicionarFoto([FromBody] CriarItemPortfolioRequest request)
    {
        var prestadorId = ObterUsuarioId();
        var item = await _proService.AdicionarItemPortfolioAsync(prestadorId, request);
        return CreatedAtAction(nameof(ObterPortfolio), item);
    }

    /// <summary>
    /// Remove um item do portfólio do prestador logado.
    /// </summary>
    [HttpDelete("portfolio/{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> RemoverFoto(int id)
    {
        var prestadorId = ObterUsuarioId();
        await _proService.RemoverItemPortfolioAsync(prestadorId, id);
        return Ok(new { mensagem = "Item de portfólio removido com sucesso." });
    }

    /// <summary>
    /// Atualiza o texto da bio de apresentação do prestador.
    /// </summary>
    [HttpPut("bio")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> AtualizarBio([FromBody] AtualizarBioRequest request)
    {
        var prestadorId = ObterUsuarioId();
        await _proService.AtualizarBioAsync(prestadorId, request.Bio);
        return Ok(new { mensagem = "Apresentação profissional atualizada com sucesso." });
    }

    private int ObterUsuarioId()
    {
        var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(claimId, out var id))
        {
            throw new UnauthorizedAccessException("Usuário não autenticado.");
        }
        return id;
    }
}
