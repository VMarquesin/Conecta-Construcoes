using Conecta.Domain.Entidades;
using Conecta.Domain.Interfaces;
using Conecta.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Conecta.Infrastructure.Repositorios;

public class ChatRepository : IChatRepository
{
    private readonly AppDbContext _context;

    public ChatRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Conversa?> ObterPorIdAsync(int id)
    {
        return await _context.Conversas
            .Include(c => c.Cliente)
                .ThenInclude(cl => cl.Usuario)
            .Include(c => c.Prestador)
                .ThenInclude(pr => pr.Usuario)
            .Include(c => c.Pedido)
            .Include(c => c.Mensagens)
                .ThenInclude(m => m.Anexos)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Conversa?> ObterPorPedidoIdAsync(int pedidoId)
    {
        return await _context.Conversas
            .Include(c => c.Cliente)
                .ThenInclude(cl => cl.Usuario)
            .Include(c => c.Prestador)
                .ThenInclude(pr => pr.Usuario)
            .Include(c => c.Pedido)
            .Include(c => c.Mensagens)
                .ThenInclude(m => m.Anexos)
            .FirstOrDefaultAsync(c => c.PedidoId == pedidoId);
    }

    public async Task<Conversa?> ObterOuCriarAsync(int clienteId, int prestadorId, int? pedidoId = null)
    {
        var conversa = await _context.Conversas
            .Include(c => c.Cliente)
                .ThenInclude(cl => cl.Usuario)
            .Include(c => c.Prestador)
                .ThenInclude(pr => pr.Usuario)
            .FirstOrDefaultAsync(c => c.ClienteId == clienteId && c.PrestadorId == prestadorId && (pedidoId == null || c.PedidoId == pedidoId));

        if (conversa == null)
        {
            conversa = new Conversa
            {
                ClienteId = clienteId,
                PrestadorId = prestadorId,
                PedidoId = pedidoId,
                CriadoEm = DateTime.UtcNow,
                AtualizadoEm = DateTime.UtcNow
            };
            await _context.Conversas.AddAsync(conversa);
            await _context.SaveChangesAsync();

            conversa = await ObterPorIdAsync(conversa.Id);
        }

        return conversa;
    }

    public async Task<IEnumerable<Conversa>> ListarConversasDoUsuarioAsync(int usuarioId)
    {
        return await _context.Conversas
            .Include(c => c.Cliente)
                .ThenInclude(cl => cl.Usuario)
            .Include(c => c.Prestador)
                .ThenInclude(pr => pr.Usuario)
            .Include(c => c.Pedido)
            .Include(c => c.Mensagens.OrderByDescending(m => m.EnviadoEm).Take(1))
            .AsNoTracking()
            .Where(c => c.ClienteId == usuarioId || c.PrestadorId == usuarioId)
            .OrderByDescending(c => c.AtualizadoEm)
            .ToListAsync();
    }

    public async Task<IEnumerable<Mensagem>> ListarMensagensDaConversaAsync(int conversaId)
    {
        return await _context.Mensagens
            .Include(m => m.Anexos)
            .Include(m => m.Remetente)
            .AsNoTracking()
            .Where(m => m.ConversaId == conversaId)
            .OrderBy(m => m.EnviadoEm)
            .ToListAsync();
    }

    public async Task<Mensagem> AdicionarMensagemAsync(Mensagem mensagem)
    {
        mensagem.EnviadoEm = DateTime.UtcNow;
        mensagem.Lida = false;

        await _context.Mensagens.AddAsync(mensagem);

        var conversa = await _context.Conversas.FindAsync(mensagem.ConversaId);
        if (conversa != null)
        {
            conversa.AtualizadoEm = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return mensagem;
    }

    public async Task MarcarComoLidasAsync(int conversaId, int usuarioLeitorId)
    {
        var mensagens = await _context.Mensagens
            .Where(m => m.ConversaId == conversaId && m.RemetenteId != usuarioLeitorId && !m.Lida)
            .ToListAsync();

        if (mensagens.Any())
        {
            foreach (var msg in mensagens)
            {
                msg.Lida = true;
                msg.LidaEm = DateTime.UtcNow;
            }
            await _context.SaveChangesAsync();
        }
    }

    public async Task<int> ContarNaoLidasAsync(int usuarioId)
    {
        return await _context.Mensagens
            .Include(m => m.Conversa)
            .CountAsync(m => !m.Lida && m.RemetenteId != usuarioId && (m.Conversa.ClienteId == usuarioId || m.Conversa.PrestadorId == usuarioId));
    }
}
