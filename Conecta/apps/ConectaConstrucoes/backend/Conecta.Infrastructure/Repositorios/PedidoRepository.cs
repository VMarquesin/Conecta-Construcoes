using Conecta.Domain.Entidades;
using Conecta.Domain.Interfaces;
using Conecta.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Conecta.Infrastructure.Repositorios;

public class PedidoRepository : IPedidoRepository
{
    private readonly AppDbContext _context;

    public PedidoRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Pedido> AdicionarAsync(Pedido pedido)
    {
        pedido.CriadoEm = DateTime.UtcNow;
        pedido.AtualizadoEm = DateTime.UtcNow;
        pedido.DataSolicitacao = DateTime.UtcNow;

        await _context.Pedidos.AddAsync(pedido);
        await _context.SaveChangesAsync();
        return pedido;
    }

    public async Task<Pedido?> ObterPorIdAsync(int id)
    {
        return await _context.Pedidos
            .Include(p => p.Cliente)
                .ThenInclude(c => c.Usuario)
            .Include(p => p.Prestador)
                .ThenInclude(pr => pr.Usuario)
            .Include(p => p.Proposta)
                .ThenInclude(prop => prop!.Itens)
            .Include(p => p.Endereco)
            .Include(p => p.Avaliacao)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<IEnumerable<Pedido>> ListarPorUsuarioAsync(int usuarioId, string? status = null)
    {
        var query = _context.Pedidos
            .Include(p => p.Cliente)
                .ThenInclude(c => c.Usuario)
            .Include(p => p.Prestador)
                .ThenInclude(pr => pr.Usuario)
            .Include(p => p.Proposta)
            .AsNoTracking()
            .Where(p => p.ClienteId == usuarioId || p.PrestadorId == usuarioId);

        if (!string.IsNullOrWhiteSpace(status))
        {
            var statusNormalizado = status.Trim().ToUpper();
            query = query.Where(p => p.Status.ToUpper() == statusNormalizado);
        }

        return await query
            .OrderByDescending(p => p.CriadoEm)
            .ToListAsync();
    }

    public async Task AtualizarStatusAsync(int pedidoId, string novoStatus)
    {
        var pedido = await _context.Pedidos.FindAsync(pedidoId);
        if (pedido != null)
        {
            pedido.Status = novoStatus;
            pedido.AtualizadoEm = DateTime.UtcNow;

            if (novoStatus == "CONCLUIDO")
            {
                pedido.ConcluidoEm = DateTime.UtcNow;
                pedido.DataConclusao = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }
    }

    public async Task AtualizarAsync(Pedido pedido)
    {
        pedido.AtualizadoEm = DateTime.UtcNow;
        _context.Pedidos.Update(pedido);
        await _context.SaveChangesAsync();
    }
}
