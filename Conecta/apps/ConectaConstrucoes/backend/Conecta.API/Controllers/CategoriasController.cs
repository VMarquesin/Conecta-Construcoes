using Conecta.Application.DTOs;
using Conecta.Application.Servicos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Conecta.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Route("api/[controller]")]
[Produces("application/json")]
public class CategoriasController : ControllerBase
{
    private readonly ICategoriaService _categoriaService;

    public CategoriasController(ICategoriaService categoriaService)
    {
        _categoriaService = categoriaService;
    }

    /// <summary>
    /// Lista todas as categorias ativas disponíveis para busca de serviços.
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<CategoriaResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ListarAtivas()
    {
        var categorias = await _categoriaService.ListarAtivasAsync();
        return Ok(categorias);
    }

    /// <summary>
    /// Obtém detalhes de uma categoria por ID.
    /// </summary>
    [HttpGet("{id:int}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CategoriaResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObterPorId(int id)
    {
        var categoria = await _categoriaService.ObterPorIdAsync(id);
        if (categoria == null)
            return NotFound(new { mensagem = $"Categoria com ID {id} não encontrada." });

        return Ok(categoria);
    }

    /// <summary>
    /// Obtém detalhes de uma categoria pelo slug (ex: eletrica, encanador).
    /// </summary>
    [HttpGet("slug/{slug}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CategoriaResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObterPorSlug(string slug)
    {
        var categoria = await _categoriaService.ObterPorSlugAsync(slug);
        if (categoria == null)
            return NotFound(new { mensagem = $"Categoria '{slug}' não encontrada." });

        return Ok(categoria);
    }
}
