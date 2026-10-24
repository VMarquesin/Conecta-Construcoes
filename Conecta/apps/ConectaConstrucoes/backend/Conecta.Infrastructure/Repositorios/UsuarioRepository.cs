using Conecta.Domain.Entidades;
using Conecta.Domain.Interfaces;
using Conecta.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Conecta.Infrastructure.Repositorios;

public class UsuarioRepository : IUsuarioRepository
{
    private readonly AppDbContext _context;

    public UsuarioRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Usuario?> ObterPorIdAsync(int id)
    {
        return await _context.Usuarios
            .Include(u => u.UsuarioRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<Usuario?> ObterPorEmailAsync(string email)
    {
        return await _context.Usuarios
            .Include(u => u.UsuarioRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.Trim().ToLower());
    }

    public async Task<IEnumerable<Usuario>> ListarAsync(int pagina = 1, int tamanhoPagina = 20, string? busca = null)
    {
        var query = _context.Usuarios
            .Include(u => u.UsuarioRoles)
                .ThenInclude(ur => ur.Role)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(busca))
        {
            var termo = busca.Trim().ToLower();
            query = query.Where(u => u.Nome.ToLower().Contains(termo) || u.Email.ToLower().Contains(termo));
        }

        return await query
            .OrderByDescending(u => u.CriadoEm)
            .Skip((pagina - 1) * tamanhoPagina)
            .Take(tamanhoPagina)
            .ToListAsync();
    }

    public async Task<int> ContarAsync(string? busca = null)
    {
        var query = _context.Usuarios.AsQueryable();

        if (!string.IsNullOrWhiteSpace(busca))
        {
            var termo = busca.Trim().ToLower();
            query = query.Where(u => u.Nome.ToLower().Contains(termo) || u.Email.ToLower().Contains(termo));
        }

        return await query.CountAsync();
    }

    public async Task<Usuario> AdicionarAsync(Usuario usuario)
    {
        usuario.CriadoEm = DateTime.UtcNow;
        usuario.AtualizadoEm = DateTime.UtcNow;
        await _context.Usuarios.AddAsync(usuario);
        await _context.SaveChangesAsync();
        return usuario;
    }

    public async Task AtualizarAsync(Usuario usuario)
    {
        usuario.AtualizadoEm = DateTime.UtcNow;
        _context.Usuarios.Update(usuario);
        await _context.SaveChangesAsync();
    }

    public async Task RemoverAsync(Usuario usuario)
    {
        _context.Usuarios.Remove(usuario);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Role>> ObterRolesDoUsuarioAsync(int usuarioId)
    {
        return await _context.UsuarioRoles
            .Where(ur => ur.UsuarioId == usuarioId)
            .Select(ur => ur.Role!)
            .ToListAsync();
    }

    public async Task AdicionarRoleAsync(int usuarioId, int roleId)
    {
        var jaExiste = await UsuarioPossuiRoleAsync(usuarioId, roleId);
        if (!jaExiste)
        {
            await _context.UsuarioRoles.AddAsync(new UsuarioRole
            {
                UsuarioId = usuarioId,
                RoleId = roleId,
                AtribuidoEm = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();
        }
    }

    public async Task RemoverRoleAsync(int usuarioId, int roleId)
    {
        var vinculo = await _context.UsuarioRoles
            .FirstOrDefaultAsync(ur => ur.UsuarioId == usuarioId && ur.RoleId == roleId);

        if (vinculo != null)
        {
            _context.UsuarioRoles.Remove(vinculo);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> UsuarioPossuiRoleAsync(int usuarioId, int roleId)
    {
        return await _context.UsuarioRoles
            .AnyAsync(ur => ur.UsuarioId == usuarioId && ur.RoleId == roleId);
    }
}
