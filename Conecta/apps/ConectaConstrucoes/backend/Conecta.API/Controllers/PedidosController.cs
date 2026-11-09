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
public class PedidosController : ControllerBase
{
    private readonly IPedidoService _pedidoService;

    public PedidosController(IPedidoService pedidoService)
    {
        _pedidoService = pedidoService;
    }

    /// <summary>
    /// Lista pedidos do usuário logado (cliente ou prestador), com suporte a filtro por status (pendente, aceito, concluido).
    /// </summary>
    [HttpGet]
    [HttpGet("meus")]
    [ProducesResponseType(typeof(IEnumerable<PedidoResumoResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ListarMeusPedidos([FromQuery] string? status = null, [FromQuery] int? clienteId = null)
    {
        var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        int usuarioId = 0;
        if (int.TryParse(claimId, out var parsedId))
            usuarioId = parsedId;
        else if (clienteId.HasValue && clienteId.Value > 0)
            usuarioId = clienteId.Value;

        if (usuarioId == 0)
        {
            return Unauthorized(new { mensagem = "Usuário não autenticado." });
        }

        var pedidos = await _pedidoService.ListarMeusPedidosAsync(usuarioId, status);
        return Ok(pedidos);
    }

    /// <summary>
    /// Obtém detalhes completos de um pedido pelo ID.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(PedidoDetalheResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObterPorId(int id, [FromQuery] int? clienteId = null)
    {
        var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        int usuarioId = 0;
        if (int.TryParse(claimId, out var parsedId))
            usuarioId = parsedId;
        else if (clienteId.HasValue && clienteId.Value > 0)
            usuarioId = clienteId.Value;

        if (usuarioId == 0)
        {
            return Unauthorized(new { mensagem = "Usuário não autenticado." });
        }

        try
        {
            var pedido = await _pedidoService.ObterDetalhesAsync(id, usuarioId);
            if (pedido == null)
                return NotFound(new { mensagem = $"Pedido #{id} não encontrado." });

            return Ok(pedido);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { mensagem = ex.Message });
        }
    }

    /// <summary>
    /// Aceita uma proposta comercial formal e formaliza o pedido (Requisito CON_017 - Status evolui para AGUARDANDO_ACEITE).
    /// </summary>
    [HttpPost("propostas/{propostaId:int}/aceitar")]
    [HttpPost("{id:int}/aceitar-proposta")]
    [Authorize]
    [ProducesResponseType(typeof(PedidoDetalheResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> AceitarProposta(int? propostaId, int? id)
    {
        var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(claimId, out var clienteId))
        {
            return Unauthorized(new { mensagem = "Usuário não autenticado." });
        }

        var propId = propostaId ?? id ?? 0;
        try
        {
            var pedido = await _pedidoService.AceitarPropostaECriarPedidoAsync(clienteId, propId);
            return Ok(pedido);
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
    /// Confirma o pagamento seguro com retenção em garantia Conecta Protege (Status evolui para AGENDADO).
    /// </summary>
    [HttpPost("{id:int}/pagamento")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ConfirmarPagamento(int id, [FromBody] PagamentoPedidoRequest request)
    {
        var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(claimId, out var clienteId))
        {
            return Unauthorized(new { mensagem = "Usuário não autenticado." });
        }

        try
        {
            await _pedidoService.ConfirmarPagamentoGarantiaAsync(clienteId, id, request);
            return Ok(new { mensagem = "Pagamento retido com sucesso na Garantia Conecta Protege. Pedido agendado!" });
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
    /// Cancela um pedido (Requisito CON_017).
    /// </summary>
    [HttpPost("{id:int}/cancelar")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Cancelar(int id)
    {
        var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(claimId, out var usuarioId))
        {
            return Unauthorized(new { mensagem = "Usuário não autenticado." });
        }

        try
        {
            await _pedidoService.CancelarPedidoAsync(usuarioId, id);
            return Ok(new { mensagem = $"Pedido #{id} cancelado com sucesso." });
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
    /// Marca um pedido como concluído pelo prestador.
    /// </summary>
    [HttpPost("{id:int}/concluir")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Concluir(int id)
    {
        var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(claimId, out var prestadorId))
        {
            return Unauthorized(new { mensagem = "Usuário não autenticado." });
        }

        try
        {
            await _pedidoService.ConcluirPedidoAsync(prestadorId, id);
            return Ok(new { mensagem = $"Pedido #{id} marcado como concluído com sucesso." });
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
