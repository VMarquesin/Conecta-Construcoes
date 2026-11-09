namespace Conecta.Application.DTOs;

public record ResumoAdminResponse(
    int TotalUsuarios,
    int Prestadores,
    int Clientes,
    int Bloqueados,
    int DocumentosPendentes,
    int DenunciasAbertas
);

public record AdminUsuarioResponse(
    string Id,
    string Nome,
    string Email,
    string Telefone,
    string Cidade,
    string Tipo,
    string Status,
    string CriadoEm,
    List<string> Roles
);

public record AtualizarUsuarioAdminRequest(
    string? Nome,
    string? Email,
    string? Telefone,
    string? Cidade,
    string? Status
);

public record BloquearUsuarioAdminRequest(
    string Motivo
);

public record AdminRoleResponse(
    string Id,
    string Nome,
    string Descricao,
    List<string> Permissoes
);

public record AdminDocumentoResponse(
    string Id,
    string UsuarioId,
    string UsuarioNome,
    string TipoUsuario,
    string TipoDocumento,
    string EnviadoEm,
    string Status,
    string? MotivoRejeicao
);

public record RejeitarDocumentoRequest(
    string Motivo
);

public record AdminDenunciaResponse(
    string Id,
    string DenuncianteNome,
    string DenunciadoId,
    string DenunciadoNome,
    string Motivo,
    string Descricao,
    string CriadaEm,
    string Status,
    string? AcaoTomada
);

public record ModerarDenunciaRequest(
    string Acao,
    string? Observacao
);

public record AtribuirRoleRequest(
    int RoleId
);

public record AtualizarStatusDenunciaRequest(
    string Status,
    string? Observacao
);
