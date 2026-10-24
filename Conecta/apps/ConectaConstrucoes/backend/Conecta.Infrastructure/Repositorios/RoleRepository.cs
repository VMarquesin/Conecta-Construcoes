using Conecta.Domain.Entidades;
using Conecta.Domain.Interfaces;
using Conecta.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Conecta.Infrastructure.Repositorios;

public class RoleRepository : IRoleRepository
{
    private readonly AppDbContext _context;

    public RoleRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Role?> ObterPorIdAsync(int id)
    {
        return await _context.Roles
            .Include(r => r.RolePermissoes)
                .ThenInclude(rp => rp.Permissao)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<Role?> ObterPorNomeAsync(string nome)
    {
        return await _context.Roles
            .Include(r => r.RolePermissoes)
                .ThenInclude(rp => rp.Permissao)
            .FirstOrDefaultAsync(r => r.Nome.ToUpper() == nome.Trim().ToUpper());
    }

    public async Task<IEnumerable<Role>> ListarAsync(bool apenasAtivos = false)
    {
        var query = _context.Roles
            .Include(r => r.RolePermissoes)
                .ThenInclude(rp => rp.Permissao)
            .AsNoTracking();

        if (apenasAtivos)
        {
            query = query.Where(r => r.Ativo);
        }

        return await query.OrderBy(r => r.Nome).ToListAsync();
    }

    public async Task<Role> AdicionarAsync(Role role)
    {
        role.CriadoEm = DateTime.UtcNow;
        await _context.Roles.AddAsync(role);
        await _context.SaveChangesAsync();
        return role;
    }

    public async Task AtualizarAsync(Role role)
    {
        _context.Roles.Update(role);
        await _context.SaveChangesAsync();
    }

    public async Task RemoverAsync(Role role)
    {
        _context.Roles.Remove(role);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Permissao>> ObterPermissoesDaRoleAsync(int roleId)
    {
        return await _context.RolePermissoes
            .Where(rp => rp.RoleId == roleId)
            .Select(rp => rp.Permissao!)
            .ToListAsync();
    }

    public async Task AdicionarPermissaoAsync(int roleId, int permissaoId)
    {
        var jaExiste = await RolePossuiPermissaoAsync(roleId, permissaoId);
        if (!jaExiste)
        {
            await _context.RolePermissoes.AddAsync(new RolePermissao
            {
                RoleId = roleId,
                PermissaoId = permissaoId,
                AtribuidoEm = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();
        }
    }

    public async Task RemoverPermissaoAsync(int roleId, int permissaoId)
    {
        var vinculo = await _context.RolePermissoes
            .FirstOrDefaultAsync(rp => rp.RoleId == roleId && rp.PermissaoId == permissaoId);

        if (vinculo != null)
        {
            _context.RolePermissoes.Remove(vinculo);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> RolePossuiPermissaoAsync(int roleId, int permissaoId)
    {
        return await _context.RolePermissoes
            .AnyAsync(rp => rp.RoleId == roleId && rp.PermissaoId == permissaoId);
    }
}
