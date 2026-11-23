using Conecta.Domain.Entidades;
using Conecta.Domain.Interfaces;
using Conecta.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Conecta.Infrastructure.Repositorios;

public class CategoriaRepository : ICategoriaRepository
{
    private readonly AppDbContext _context;

    public CategoriaRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Categoria>> ListarAtivasAsync()
    {
        return await _context.Categorias
            .AsNoTracking()
            .Where(c => c.Ativo)
            .OrderBy(c => c.Nome)
            .ToListAsync();
    }

    public async Task<IEnumerable<Categoria>> ListarTodasAsync()
    {
        return await _context.Categorias
            .AsNoTracking()
            .OrderBy(c => c.Nome)
            .ToListAsync();
    }

    public async Task<Categoria?> ObterPorIdAsync(int id)
    {
        return await _context.Categorias.FindAsync(id);
    }

    public async Task<Categoria?> ObterPorSlugAsync(string slug)
    {
        return await _context.Categorias
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Slug.ToLower() == slug.Trim().ToLower());
    }

    public async Task<Categoria> AdicionarAsync(Categoria categoria)
    {
        categoria.CriadoEm = DateTime.UtcNow;
        categoria.AtualizadoEm = DateTime.UtcNow;
        await _context.Categorias.AddAsync(categoria);
        await _context.SaveChangesAsync();
        return categoria;
    }

    public async Task AtualizarAsync(Categoria categoria)
    {
        categoria.AtualizadoEm = DateTime.UtcNow;
        _context.Categorias.Update(categoria);
        await _context.SaveChangesAsync();
    }
}
