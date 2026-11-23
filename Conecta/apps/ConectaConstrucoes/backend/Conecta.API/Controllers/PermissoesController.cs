using Conecta.Application.DTOs;
using Conecta.Application.Servicos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Conecta.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
[Authorize(Roles = "ADMIN_MASTER,SUPORTE,ANALISTA")]
public class PermissoesController : ControllerBase
{
    private readonly IPermissaoService _permissaoService;

    public PermissoesController(IPermissaoService permissaoService)
    {
        _permissaoService = permissaoService;
    }

    /// <summary>
    /// Lista as permissões cadastradas no sistema, com opção de filtrar por recurso (ex: USUARIOS, FINANCAS, DENUNCIAS).
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<PermissaoResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Listar([FromQuery] string? recurso = null)
    {
        var permissoes = await _permissaoService.ListarAsync(recurso);
        return Ok(permissoes);
    }

    /// <summary>
    /// Obtém detalhes de uma permissão pelo ID.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(PermissaoResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObterPorId(int id)
    {
        var perm = await _permissaoService.ObterPorIdAsync(id);
        if (perm == null)
            return NotFound(new { mensagem = $"Permissão com ID {id} não encontrada." });

        return Ok(perm);
    }

    /// <summary>
    /// Cadastra uma nova permissão no sistema.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "ADMIN_MASTER")]
    [ProducesResponseType(typeof(PermissaoResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Criar([FromBody] CriarPermissaoRequest request)
    {
        try
        {
            var criada = await _permissaoService.CriarAsync(request);
            return CreatedAtAction(nameof(ObterPorId), new { id = criada.Id }, criada);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }

    /// <summary>
    /// Obtém todas as permissões ativas consolidadas de um usuário específico através de suas roles.
    /// </summary>
    [HttpGet("usuario/{usuarioId:int}")]
    [ProducesResponseType(typeof(IEnumerable<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ObterPermissoesDoUsuario(int usuarioId)
    {
        var permissoes = await _permissaoService.ObterPermissoesDoUsuarioAsync(usuarioId);
        return Ok(permissoes);
    }
}
