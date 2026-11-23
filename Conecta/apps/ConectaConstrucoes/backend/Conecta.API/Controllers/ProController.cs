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
    public async Task<IActionResult> ObterDashboard([FromQuery] int? prestadorId = null)
    {
        var id = ObterUsuarioId(prestadorId);
        try
        {
            var dashboard = await _proService.ObterDashboardAsync(id);
            return Ok(dashboard);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
    }

    /// <summary>
    /// Retorna estatísticas consolidadas consultando a View vw_estatisticas_prestador.
    /// </summary>
    [HttpGet("dashboard/estatisticas")]
    [ProducesResponseType(typeof(ProEstatisticasResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> ObterEstatisticas([FromQuery] int? prestadorId = null)
    {
        var id = ObterUsuarioId(prestadorId);
        var stats = await _proService.ObterEstatisticasAsync(id);
        if (stats == null)
            return NotFound(new { mensagem = "Estatísticas do prestador não encontradas." });

        return Ok(stats);
    }

    /// <summary>
    /// Lista as solicitações abertas / pendentes para o prestador.
    /// </summary>
    [HttpGet("solicitacoes")]
    [ProducesResponseType(typeof(IEnumerable<ProSolicitacaoPendenteDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ListarSolicitacoes([FromQuery] int? prestadorId = null)
    {
        var id = ObterUsuarioId(prestadorId);
        var lista = await _proService.ListarSolicitacoesAbertasAsync(id);
        return Ok(lista);
    }

    /// <summary>
    /// Lista os pedidos agendados / agenda do prestador.
    /// </summary>
    [HttpGet("agenda")]
    [ProducesResponseType(typeof(IEnumerable<PedidoResumoResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ListarAgenda([FromQuery] int? prestadorId = null)
    {
        var id = ObterUsuarioId(prestadorId);
        var agenda = await _proService.ListarAgendaAsync(id);
        return Ok(agenda);
    }

    /// <summary>
    /// Alterna a disponibilidade do prestador (Disponível vs Ocupado).
    /// </summary>
    [HttpPatch("disponibilidade")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> AtualizarDisponibilidade([FromBody] AtualizarDisponibilidadeRequest request, [FromQuery] int? prestadorId = null)
    {
        var id = ObterUsuarioId(prestadorId);
        try
        {
            await _proService.AtualizarDisponibilidadeAsync(id, request.Status);
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
    [HttpPost("solicitacoes/{id:int}/propostas")]
    [ProducesResponseType(typeof(PropostaResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> EnviarProposta(int id, [FromBody] EnviarPropostaRequest request, [FromQuery] int? prestadorId = null)
    {
        var pId = ObterUsuarioId(prestadorId);
        try
        {
            var proposta = await _solicitacaoService.EnviarPropostaAsync(pId, id, request);
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
    public async Task<IActionResult> RecusarSolicitacao(int id, [FromQuery] int? prestadorId = null)
    {
        var pId = ObterUsuarioId(prestadorId);
        try
        {
            await _solicitacaoService.RecusarSolicitacaoAsync(pId, id);
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
    public async Task<IActionResult> ObterPortfolio([FromQuery] int? prestadorId = null)
    {
        var pId = ObterUsuarioId(prestadorId);
        var portfolio = await _proService.ObterPortfolioAsync(pId);
        return Ok(portfolio);
    }

    /// <summary>
    /// Adiciona uma nova foto/trabalho ao portfólio (Requisito CON_019).
    /// </summary>
    [HttpPost("portfolio")]
    [ProducesResponseType(typeof(FotoPortfolioDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> AdicionarFoto([FromBody] CriarItemPortfolioRequest request, [FromQuery] int? prestadorId = null)
    {
        var pId = ObterUsuarioId(prestadorId);
        var item = await _proService.AdicionarItemPortfolioAsync(pId, request);
        return CreatedAtAction(nameof(ObterPortfolio), item);
    }

    /// <summary>
    /// Remove um item do portfólio do prestador logado.
    /// </summary>
    [HttpDelete("portfolio/{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> RemoverFoto(int id, [FromQuery] int? prestadorId = null)
    {
        var pId = ObterUsuarioId(prestadorId);
        await _proService.RemoverItemPortfolioAsync(pId, id);
        return Ok(new { mensagem = "Item de portfólio removido com sucesso." });
    }

    /// <summary>
    /// Atualiza o texto da bio de apresentação do prestador.
    /// </summary>
    [HttpPut("bio")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> AtualizarBio([FromBody] AtualizarBioRequest request, [FromQuery] int? prestadorId = null)
    {
        var pId = ObterUsuarioId(prestadorId);
        await _proService.AtualizarBioAsync(pId, request.Bio);
        return Ok(new { mensagem = "Apresentação profissional atualizada com sucesso." });
    }

    private int ObterUsuarioId(int? fallbackId = null)
    {
        var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        if (int.TryParse(claimId, out var id))
        {
            return id;
        }

        if (fallbackId.HasValue && fallbackId.Value > 0)
        {
            return fallbackId.Value;
        }

        throw new UnauthorizedAccessException("Usuário não autenticado.");
    }
}
