using Conecta.Domain.Entidades;

namespace Conecta.Domain.Interfaces;

public record ResumoAdminDados(
    int TotalUsuarios,
    int Prestadores,
    int Clientes,
    int Bloqueados,
    int DocumentosPendentes,
    int DenunciasAbertas
);

public interface IAdminRepository
{
    Task<ResumoAdminDados> ObterResumoAsync();
    Task<IEnumerable<DocumentoPrestador>> ListarDocumentosPendentesAsync();
    Task<DocumentoPrestador?> ObterDocumentoPorIdAsync(int id);
    Task AprovarDocumentoAsync(int id, int analisadorId);
    Task RejeitarDocumentoAsync(int id, string motivo, int analisadorId);
    Task<IEnumerable<Denuncia>> ListarDenunciasAsync();
    Task<Denuncia?> ObterDenunciaPorIdAsync(int id);
    Task ModerarDenunciaAsync(int id, string acao, string observacao, int moderadorId);
    Task BloquearUsuarioAsync(int usuarioId, string motivo, int adminId);
    Task DesbloquearUsuarioAsync(int usuarioId, int adminId);
}
