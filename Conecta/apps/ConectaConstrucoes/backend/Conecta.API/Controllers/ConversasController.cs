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
public class ConversasController : ControllerBase
{
    private readonly IChatService _chatService;

    public ConversasController(IChatService chatService)
    {
        _chatService = chatService;
    }

    /// <summary>
    /// Lista todas as conversas do usuário autenticado para exibição no dropdown ou painel flutuante (Requisito CON_018).
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ConversaResumoResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ListarMinhasConversas()
    {
        var usuarioId = ObterUsuarioId();
        var conversas = await _chatService.ListarConversasDoUsuarioAsync(usuarioId);
        return Ok(conversas);
    }

    /// <summary>
    /// Obtém detalhes de uma conversa específica.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ConversaResumoResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObterConversa(int id)
    {
        var usuarioId = ObterUsuarioId();
        try
        {
            var conversa = await _chatService.ObterConversaAsync(id, usuarioId);
            if (conversa == null)
                return NotFound(new { mensagem = $"Conversa #{id} não encontrada." });

            return Ok(conversa);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { mensagem = ex.Message });
        }
    }

    /// <summary>
    /// Inicia ou resgata uma conversa entre o cliente e o prestador informado.
    /// </summary>
    [HttpPost("iniciar")]
    [ProducesResponseType(typeof(ConversaResumoResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Iniciar([FromBody] IniciarConversaRequest request)
    {
        var clienteId = ObterUsuarioId();
        var conversa = await _chatService.IniciarConversaAsync(clienteId, request);
        return Ok(conversa);
    }

    /// <summary>
    /// Lista mensagens cronológicas de uma conversa ou pedido.
    /// </summary>
    [HttpGet("{id:int}/mensagens")]
    [ProducesResponseType(typeof(IEnumerable<MensagemItemResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ListarMensagens(int id, [FromQuery] int? usuarioId = null)
    {
        try
        {
            var uId = ObterUsuarioId(usuarioId);
            var mensagens = await _chatService.ListarMensagensAsync(id, uId);
            return Ok(mensagens);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { mensagem = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
    }

    /// <summary>
    /// Envia uma nova mensagem de texto ou anexo de foto no chat (Requisito CON_018).
    /// </summary>
    [HttpPost("{id:int}/mensagens")]
    [ProducesResponseType(typeof(MensagemItemResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> EnviarMensagem(int id, [FromBody] EnviarMensagemRequest request, [FromQuery] int? usuarioId = null)
    {
        try
        {
            var remetenteId = ObterUsuarioId(usuarioId);
            var mensagemCriada = await _chatService.EnviarMensagemAsync(remetenteId, id, request);
            return CreatedAtAction(nameof(ListarMensagens), new { id }, mensagemCriada);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { mensagem = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
    }

    /// <summary>
    /// Marca as mensagens da conversa como lidas pelo usuário atual.
    /// </summary>
    [HttpPost("{id:int}/lidas")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> MarcarLidas(int id, [FromQuery] int? usuarioId = null)
    {
        var uId = ObterUsuarioId(usuarioId);
        await _chatService.MarcarComoLidasAsync(id, uId);
        return Ok(new { sucesso = true });
    }

    /// <summary>
    /// Retorna a contagem total de mensagens não lidas destinadas ao usuário autenticado (para o badge do header).
    /// </summary>
    [HttpGet("nao-lidas/total")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> TotalNaoLidas([FromQuery] int? usuarioId = null)
    {
        var uId = ObterUsuarioId(usuarioId);
        var total = await _chatService.ObterTotalNaoLidasAsync(uId);
        return Ok(new { totalNaoLidas = total });
    }

    private int ObterUsuarioId(int? fallbackId = null)
    {
        var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
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
