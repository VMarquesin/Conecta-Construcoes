using Conecta.Domain.Entidades;
using Conecta.Domain.Enums;
using Conecta.Domain.Interfaces;
using Conecta.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Conecta.Infrastructure.Repositorios;

public class SolicitacaoRepository : ISolicitacaoRepository
{
    private readonly AppDbContext _context;

    public SolicitacaoRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Solicitacao> AdicionarAsync(Solicitacao solicitacao)
    {
        solicitacao.CriadoEm = DateTime.UtcNow;
        solicitacao.AtualizadoEm = DateTime.UtcNow;
        solicitacao.Status = StatusSolicitacao.ABERTA; // Requisito CON_016

        await _context.Solicitacoes.AddAsync(solicitacao);
        await _context.SaveChangesAsync();
        return solicitacao;
    }

    public async Task<Solicitacao?> ObterPorIdAsync(int id)
    {
        return await _context.Solicitacoes
            .Include(s => s.Imagens)
            .Include(s => s.Propostas)
                .ThenInclude(p => p.Itens)
            .Include(s => s.Cliente)
                .ThenInclude(c => c.Usuario)
            .Include(s => s.Prestador)
                .ThenInclude(p => p.Usuario)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<IEnumerable<Solicitacao>> ListarPorClienteAsync(int clienteId)
    {
        return await _context.Solicitacoes
            .Include(s => s.Imagens)
            .Include(s => s.Prestador)
                .ThenInclude(p => p.Usuario)
            .AsNoTracking()
            .Where(s => s.ClienteId == clienteId)
            .OrderByDescending(s => s.CriadoEm)
            .ToListAsync();
    }

    public async Task<IEnumerable<Solicitacao>> ListarPendentesPorPrestadorAsync(int prestadorId)
    {
        return await _context.Solicitacoes
            .Include(s => s.Imagens)
            .Include(s => s.Cliente)
                .ThenInclude(c => c.Usuario)
            .AsNoTracking()
            .Where(s => s.PrestadorId == prestadorId && (s.Status == StatusSolicitacao.ABERTA || s.Status == StatusSolicitacao.AGUARDANDO_PROPOSTA))
            .OrderByDescending(s => s.CriadoEm)
            .ToListAsync();
    }

    public async Task AtualizarStatusAsync(int solicitacaoId, string novoStatus)
    {
        var s = await _context.Solicitacoes.FindAsync(solicitacaoId);
        if (s != null)
        {
            if (Enum.TryParse<StatusSolicitacao>(novoStatus, true, out var statusSol))
                s.Status = statusSol;
            s.AtualizadoEm = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<Proposta> AdicionarPropostaAsync(Proposta proposta)
    {
        proposta.CriadoEm = DateTime.UtcNow;
        proposta.AtualizadoEm = DateTime.UtcNow;
        proposta.Status = StatusProposta.ENVIADA;

        await _context.Propostas.AddAsync(proposta);
        await _context.SaveChangesAsync();
        return proposta;
    }

    public async Task<Proposta?> ObterPropostaPorIdAsync(int propostaId)
    {
        return await _context.Propostas
            .Include(p => p.Itens)
            .Include(p => p.Solicitacao)
            .FirstOrDefaultAsync(p => p.Id == propostaId);
    }

    public async Task AtualizarStatusPropostaAsync(int propostaId, string novoStatus)
    {
        var p = await _context.Propostas.FindAsync(propostaId);
        if (p != null)
        {
            if (Enum.TryParse<StatusProposta>(novoStatus, true, out var statusProp))
                p.Status = statusProp;
            p.AtualizadoEm = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}
