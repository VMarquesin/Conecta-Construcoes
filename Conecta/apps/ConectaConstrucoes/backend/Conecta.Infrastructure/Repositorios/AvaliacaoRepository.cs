using Conecta.Domain.Entidades;
using Conecta.Domain.Interfaces;
using Conecta.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Conecta.Infrastructure.Repositorios;

public class AvaliacaoRepository : IAvaliacaoRepository
{
    private readonly AppDbContext _context;

    public AvaliacaoRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Avaliacao> AdicionarAsync(Avaliacao avaliacao)
    {
        _context.Avaliacoes.Add(avaliacao);
        await _context.SaveChangesAsync();
        return avaliacao;
    }

    public async Task<Avaliacao?> ObterPorIdAsync(int id)
    {
        return await _context.Avaliacoes
            .Include(a => a.Cliente)
                .ThenInclude(c => c.Usuario)
            .Include(a => a.Prestador)
                .ThenInclude(p => p.Usuario)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<Avaliacao?> ObterPorPedidoIdAsync(int pedidoId)
    {
        return await _context.Avaliacoes
            .Include(a => a.Cliente)
                .ThenInclude(c => c.Usuario)
            .FirstOrDefaultAsync(a => a.PedidoId == pedidoId);
    }

    public async Task<IEnumerable<Avaliacao>> ListarPorPrestadorAsync(int prestadorId)
    {
        return await _context.Avaliacoes
            .Include(a => a.Cliente)
                .ThenInclude(c => c.Usuario)
            .Where(a => a.PrestadorId == prestadorId)
            .OrderByDescending(a => a.DataCriacao)
            .ToListAsync();
    }
}
