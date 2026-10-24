using Conecta.Application.DTOs;
using Conecta.Application.Servicos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Conecta.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class UsuariosController : ControllerBase
{
    private readonly IUsuarioService _usuarioService;

    public UsuariosController(IUsuarioService usuarioService)
    {
        _usuarioService = usuarioService;
    }

    /// <summary>
    /// Lista usuários de forma paginada com suporte a filtro de busca.
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "ADMIN_MASTER,SUPORTE,ANALISTA")]
    [ProducesResponseType(typeof(UsuarioPaginadoResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Listar(
        [FromQuery] int pagina = 1,
        [FromQuery] int tamanhoPagina = 20,
        [FromQuery] string? busca = null)
    {
        var resultado = await _usuarioService.ListarAsync(pagina, tamanhoPagina, busca);
        return Ok(resultado);
    }

    /// <summary>
    /// Obtém detalhes de um usuário pelo ID.
    /// </summary>
    [HttpGet("{id:int}")]
    [Authorize]
    [ProducesResponseType(typeof(UsuarioResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObterPorId(int id)
    {
        var usuario = await _usuarioService.ObterPorIdAsync(id);
        if (usuario == null)
            return NotFound(new { mensagem = $"Usuário com ID {id} não encontrado." });

        return Ok(usuario);
    }

    /// <summary>
    /// Cadastra um novo usuário na plataforma.
    /// </summary>
    [HttpPost]
    [AllowAnonymous] // Permite novos cadastros de clientes/prestadores
    [ProducesResponseType(typeof(UsuarioResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Criar([FromBody] CriarUsuarioRequest request)
    {
        try
        {
            var novoUsuario = await _usuarioService.CriarAsync(request);
            return CreatedAtAction(nameof(ObterPorId), new { id = novoUsuario.Id }, novoUsuario);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }

    /// <summary>
    /// Atualiza dados cadastrais e status do usuário.
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize]
    [ProducesResponseType(typeof(UsuarioResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Atualizar(int id, [FromBody] AtualizarUsuarioRequest request)
    {
        try
        {
            var atualizado = await _usuarioService.AtualizarAsync(id, request);
            return Ok(atualizado);
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
    /// Altera a senha do usuário.
    /// </summary>
    [HttpPut("{id:int}/senha")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> AlterarSenha(int id, [FromBody] AlterarSenhaRequest request)
    {
        try
        {
            await _usuarioService.AlterarSenhaAsync(id, request);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { mensagem = ex.Message });
        }
    }

    /// <summary>
    /// Remove um usuário da plataforma.
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "ADMIN_MASTER")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Remover(int id)
    {
        try
        {
            await _usuarioService.RemoverAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
    }

    /// <summary>
    /// Obtém todas as roles atribuídas a um usuário.
    /// </summary>
    [HttpGet("{id:int}/roles")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ObterRoles(int id)
    {
        var roles = await _usuarioService.ObterRolesAsync(id);
        return Ok(roles);
    }

    /// <summary>
    /// Associa uma role/papel a um usuário (usuario_roles).
    /// </summary>
    [HttpPost("{id:int}/roles")]
    [Authorize(Roles = "ADMIN_MASTER")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AssociarRole(int id, [FromBody] AssociarRoleRequest request)
    {
        try
        {
            await _usuarioService.AssociarRoleAsync(id, request.RoleId);
            return Ok(new { mensagem = $"Role {request.RoleId} associada ao usuário {id} com sucesso." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
    }

    /// <summary>
    /// Desassocia uma role/papel de um usuário (usuario_roles).
    /// </summary>
    [HttpDelete("{id:int}/roles/{roleId:int}")]
    [Authorize(Roles = "ADMIN_MASTER")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoverRole(int id, int roleId)
    {
        try
        {
            await _usuarioService.RemoverRoleAsync(id, roleId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
    }
}
