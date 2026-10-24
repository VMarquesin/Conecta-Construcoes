using Conecta.Domain.Entidades;
using Conecta.Domain.Interfaces;
using Conecta.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Conecta.Infrastructure.Repositorios;

public class PermissaoRepository : IPermissaoRepository
{
    private readonly AppDbContext _context;

    public PermissaoRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Permissao?> ObterPorIdAsync(int id)
    {
        return await _context.Permissoes.FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Permissao?> ObterPorNomeAsync(string nome)
    {
        return await _context.Permissoes.FirstOrDefaultAsync(p => p.Nome.ToUpper() == nome.Trim().ToUpper());
    }

    public async Task<IEnumerable<Permissao>> ListarAsync(string? recurso = null)
    {
        var query = _context.Permissoes.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(recurso))
        {
            query = query.Where(p => p.Recurso != null && p.Recurso.ToUpper() == recurso.Trim().ToUpper());
        }

        return await query.OrderBy(p => p.Nome).ToListAsync();
    }

    public async Task<Permissao> AdicionarAsync(Permissao permissao)
    {
        permissao.CriadoEm = DateTime.UtcNow;
        await _context.Permissoes.AddAsync(permissao);
        await _context.SaveChangesAsync();
        return permissao;
    }

    public async Task<IEnumerable<Permissao>> ObterPermissoesDoUsuarioAsync(int usuarioId)
    {
        return await _context.UsuarioRoles
            .Where(ur => ur.UsuarioId == usuarioId && ur.Role!.Ativo)
            .SelectMany(ur => ur.Role!.RolePermissoes)
            .Select(rp => rp.Permissao!)
            .Distinct()
            .ToListAsync();
    }
}
