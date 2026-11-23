using Conecta.Application.DTOs;
using Conecta.Domain.Interfaces;

namespace Conecta.Application.Servicos;

public class CategoriaService : ICategoriaService
{
    private readonly ICategoriaRepository _categoriaRepository;

    public CategoriaService(ICategoriaRepository categoriaRepository)
    {
        _categoriaRepository = categoriaRepository;
    }

    public async Task<IEnumerable<CategoriaResponse>> ListarAtivasAsync()
    {
        var categorias = await _categoriaRepository.ListarAtivasAsync();
        return categorias.Select(c => new CategoriaResponse(
            c.Id,
            c.Nome,
            c.Slug,
            c.Descricao,
            c.IconeUrl,
            c.Ativo
        ));
    }

    public async Task<IEnumerable<CategoriaResponse>> ListarTodasAsync()
    {
        var categorias = await _categoriaRepository.ListarTodasAsync();
        return categorias.Select(c => new CategoriaResponse(
            c.Id,
            c.Nome,
            c.Slug,
            c.Descricao,
            c.IconeUrl,
            c.Ativo
        ));
    }

    public async Task<CategoriaResponse?> ObterPorIdAsync(int id)
    {
        var c = await _categoriaRepository.ObterPorIdAsync(id);
        return c == null ? null : new CategoriaResponse(
            c.Id,
            c.Nome,
            c.Slug,
            c.Descricao,
            c.IconeUrl,
            c.Ativo
        );
    }

    public async Task<CategoriaResponse?> ObterPorSlugAsync(string slug)
    {
        var c = await _categoriaRepository.ObterPorSlugAsync(slug);
        return c == null ? null : new CategoriaResponse(
            c.Id,
            c.Nome,
            c.Slug,
            c.Descricao,
            c.IconeUrl,
            c.Ativo
        );
    }
}
