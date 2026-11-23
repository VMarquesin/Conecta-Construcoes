using Conecta.Application.DTOs;
using Conecta.Application.Servicos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Conecta.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
[Authorize(Roles = "ADMIN_MASTER")]
public class RolesController : ControllerBase
{
    private readonly IRoleService _roleService;

    public RolesController(IRoleService roleService)
    {
        _roleService = roleService;
    }

    /// <summary>
    /// Lista todos os papéis (roles) do sistema.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<RoleResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Listar([FromQuery] bool apenasAtivos = false)
    {
        var roles = await _roleService.ListarAsync(apenasAtivos);
        return Ok(roles);
    }

    /// <summary>
    /// Obtém detalhes de um papel (role) pelo ID, incluindo suas permissões vinculadas.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(RoleResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObterPorId(int id)
    {
        var role = await _roleService.ObterPorIdAsync(id);
        if (role == null)
            return NotFound(new { mensagem = $"Role com ID {id} não encontrada." });

        return Ok(role);
    }

    /// <summary>
    /// Cadastra um novo papel (role) no sistema.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(RoleResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Criar([FromBody] CriarRoleRequest request)
    {
        try
        {
            var criada = await _roleService.CriarAsync(request);
            return CreatedAtAction(nameof(ObterPorId), new { id = criada.Id }, criada);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }

    /// <summary>
    /// Atualiza dados de um papel (role).
    /// </summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(RoleResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Atualizar(int id, [FromBody] AtualizarRoleRequest request)
    {
        try
        {
            var atualizada = await _roleService.AtualizarAsync(id, request);
            return Ok(atualizada);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
    }

    /// <summary>
    /// Remove um papel (role) do sistema.
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Remover(int id)
    {
        try
        {
            await _roleService.RemoverAsync(id);
            return NoContent();
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
    /// Lista as permissões vinculadas a um determinado papel (role_permissoes).
    /// </summary>
    [HttpGet("{id:int}/permissoes")]
    [ProducesResponseType(typeof(IEnumerable<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ObterPermissoes(int id)
    {
        var permissoes = await _roleService.ObterPermissoesAsync(id);
        return Ok(permissoes);
    }

    /// <summary>
    /// Associa uma permissão a um papel (role_permissoes).
    /// </summary>
    [HttpPost("{id:int}/permissoes")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AssociarPermissao(int id, [FromBody] AssociarPermissaoRequest request)
    {
        try
        {
            await _roleService.AssociarPermissaoAsync(id, request.PermissaoId);
            return Ok(new { mensagem = $"Permissão {request.PermissaoId} vinculada à role {id} com sucesso." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
    }

    /// <summary>
    /// Desassocia uma permissão de um papel (role_permissoes).
    /// </summary>
    [HttpDelete("{id:int}/permissoes/{permissaoId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoverPermissao(int id, int permissaoId)
    {
        try
        {
            await _roleService.RemoverPermissaoAsync(id, permissaoId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
    }
}
