using System.Text.Json;
using Conecta.Domain.Entidades;
using Conecta.Domain.Enums;
using Conecta.Domain.Interfaces;
using Conecta.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Conecta.Infrastructure.Repositorios;

public class AdminRepository : IAdminRepository
{
    private readonly AppDbContext _context;

    public AdminRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ResumoAdminDados> ObterResumoAsync()
    {
        var totalUsuarios = await _context.Usuarios.CountAsync();
        var totalPrestadores = await _context.Prestadores.CountAsync();
        var totalClientes = await _context.Clientes.CountAsync();
        var bloqueados = await _context.Usuarios.CountAsync(u => u.StatusConta == StatusConta.BLOQUEADA || !u.Ativo);
        var docsPendentes = await _context.DocumentosPrestadores.CountAsync(d => d.Status == StatusDocumento.PENDENTE);
        var denunciasAbertas = await _context.Denuncias.CountAsync(d => d.Status == StatusDenuncia.ABERTA);

        return new ResumoAdminDados(
            totalUsuarios,
            totalPrestadores,
            totalClientes,
            bloqueados,
            docsPendentes,
            denunciasAbertas
        );
    }

    public async Task<IEnumerable<DocumentoPrestador>> ListarDocumentosPendentesAsync()
    {
        return await _context.DocumentosPrestadores
            .Include(d => d.Prestador)
                .ThenInclude(p => p.Usuario)
            .Where(d => d.Status == StatusDocumento.PENDENTE)
            .OrderBy(d => d.SubmetidoEm)
            .ToListAsync();
    }

    public async Task<DocumentoPrestador?> ObterDocumentoPorIdAsync(int id)
    {
        return await _context.DocumentosPrestadores
            .Include(d => d.Prestador)
                .ThenInclude(p => p.Usuario)
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task AprovarDocumentoAsync(int id, int analisadorId)
    {
        var doc = await _context.DocumentosPrestadores.FindAsync(id);
        if (doc == null) return;

        doc.Status = StatusDocumento.APROVADO;
        doc.AnalisadoPor = analisadorId;
        doc.AnalisadoEm = DateTime.UtcNow;

        // Verifica se o prestador ainda tem outros documentos pendentes
        var prestadorId = doc.PrestadorId;
        var usuario = await _context.Usuarios.FindAsync(prestadorId);
        if (usuario != null)
        {
            usuario.Verificado = true;
            usuario.StatusVerificacao = StatusVerificacao.VERIFICADO;
        }

        _context.AuditLogs.Add(new AuditLog
        {
            UsuarioId = analisadorId,
            TabelaAfetada = "documentos_prestador",
            IdRegistro = id,
            Acao = "APROVAR",
            DadosDepois = JsonSerializer.Serialize(new { doc.Status, AnalisadoPor = analisadorId }),
            CriadoEm = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
    }

    public async Task RejeitarDocumentoAsync(int id, string motivo, int analisadorId)
    {
        var doc = await _context.DocumentosPrestadores.FindAsync(id);
        if (doc == null) return;

        doc.Status = StatusDocumento.REJEITADO;
        doc.MotivoRejeicao = motivo;
        doc.AnalisadoPor = analisadorId;
        doc.AnalisadoEm = DateTime.UtcNow;

        var prestadorId = doc.PrestadorId;
        var usuario = await _context.Usuarios.FindAsync(prestadorId);
        if (usuario != null)
        {
            usuario.StatusVerificacao = StatusVerificacao.REJEITADO;
        }

        _context.AuditLogs.Add(new AuditLog
        {
            UsuarioId = analisadorId,
            TabelaAfetada = "documentos_prestador",
            IdRegistro = id,
            Acao = "REJEITAR",
            DadosDepois = JsonSerializer.Serialize(new { doc.Status, motivo, AnalisadoPor = analisadorId }),
            CriadoEm = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Denuncia>> ListarDenunciasAsync()
    {
        return await _context.Denuncias
            .Include(d => d.UsuarioDenunciante)
            .Include(d => d.UsuarioDenunciado)
            .OrderByDescending(d => d.CriadoEm)
            .ToListAsync();
    }

    public async Task<Denuncia?> ObterDenunciaPorIdAsync(int id)
    {
        return await _context.Denuncias
            .Include(d => d.UsuarioDenunciante)
            .Include(d => d.UsuarioDenunciado)
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task ModerarDenunciaAsync(int id, string acao, string observacao, int moderadorId)
    {
        var denuncia = await _context.Denuncias.FindAsync(id);
        if (denuncia == null) return;

        if (Enum.TryParse<StatusDenuncia>(acao, true, out var statusDenuncia))
            denuncia.Status = statusDenuncia;
        else if (acao.Equals("ARQUIVAR", StringComparison.OrdinalIgnoreCase) || acao.Equals("IMPROCEDENTE", StringComparison.OrdinalIgnoreCase))
            denuncia.Status = StatusDenuncia.ENCERRADA;
        else if (acao.Equals("ADVERTIR", StringComparison.OrdinalIgnoreCase) || acao.Equals("PROCEDENTE", StringComparison.OrdinalIgnoreCase))
            denuncia.Status = StatusDenuncia.RESOLVIDA;
        else if (acao.Equals("BLOQUEAR_USUARIO", StringComparison.OrdinalIgnoreCase) || acao.Equals("BANIDO", StringComparison.OrdinalIgnoreCase))
            denuncia.Status = StatusDenuncia.BANIDO;

        denuncia.Resultado = observacao;
        denuncia.AnalisadoPor = moderadorId;
        denuncia.AnalisadoEm = DateTime.UtcNow;

        if (denuncia.Status == StatusDenuncia.BANIDO || acao.Equals("BLOQUEAR_USUARIO", StringComparison.OrdinalIgnoreCase))
        {
            var usuario = await _context.Usuarios.FindAsync(denuncia.UsuarioDenunciadoId);
            if (usuario != null)
            {
                usuario.Ativo = false;
                usuario.StatusConta = StatusConta.BLOQUEADA;
            }
        }

        _context.AuditLogs.Add(new AuditLog
        {
            UsuarioId = moderadorId,
            TabelaAfetada = "denuncias",
            IdRegistro = id,
            Acao = acao,
            DadosDepois = JsonSerializer.Serialize(new { acao, observacao, ModeradoPor = moderadorId }),
            CriadoEm = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
    }

    public async Task BloquearUsuarioAsync(int usuarioId, string motivo, int adminId)
    {
        var usuario = await _context.Usuarios.FindAsync(usuarioId);
        if (usuario == null) return;

        usuario.Ativo = false;
        usuario.StatusConta = StatusConta.BLOQUEADA;
        usuario.AtualizadoEm = DateTime.UtcNow;

        _context.AuditLogs.Add(new AuditLog
        {
            UsuarioId = adminId,
            TabelaAfetada = "usuarios",
            IdRegistro = usuarioId,
            Acao = "BLOQUEAR",
            DadosDepois = JsonSerializer.Serialize(new { motivo, BloqueadoPor = adminId }),
            CriadoEm = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
    }

    public async Task DesbloquearUsuarioAsync(int usuarioId, int adminId)
    {
        var usuario = await _context.Usuarios.FindAsync(usuarioId);
        if (usuario == null) return;

        usuario.Ativo = true;
        usuario.StatusConta = StatusConta.ATIVA;
        usuario.AtualizadoEm = DateTime.UtcNow;

        _context.AuditLogs.Add(new AuditLog
        {
            UsuarioId = adminId,
            TabelaAfetada = "usuarios",
            IdRegistro = usuarioId,
            Acao = "DESBLOQUEAR",
            CriadoEm = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
    }
}
