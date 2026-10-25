using Conecta.Application.DTOs;
using Conecta.Domain.Entidades;
using Conecta.Domain.Interfaces;

namespace Conecta.Application.Servicos;

public class AdminService : IAdminService
{
    private readonly IAdminRepository _adminRepository;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IRoleRepository _roleRepository;

    public AdminService(
        IAdminRepository adminRepository,
        IUsuarioRepository usuarioRepository,
        IRoleRepository roleRepository)
    {
        _adminRepository = adminRepository;
        _usuarioRepository = usuarioRepository;
        _roleRepository = roleRepository;
    }

    public async Task<ResumoAdminResponse> ObterResumoAsync()
    {
        var dados = await _adminRepository.ObterResumoAsync();
        return new ResumoAdminResponse(
            dados.TotalUsuarios,
            dados.Prestadores,
            dados.Clientes,
            dados.Bloqueados,
            dados.DocumentosPendentes,
            dados.DenunciasAbertas
        );
    }

    public async Task<IEnumerable<AdminUsuarioResponse>> ListarUsuariosAsync(string? busca, string? tipo, string? status)
    {
        var usuarios = await _usuarioRepository.ListarAsync(1, 100, busca);

        if (!string.IsNullOrWhiteSpace(tipo))
        {
            usuarios = usuarios.Where(u => string.Equals(u.Perfil, tipo, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            if (status.Equals("BLOQUEADO", StringComparison.OrdinalIgnoreCase))
                usuarios = usuarios.Where(u => !u.Ativo || u.StatusConta == "BLOQUEADA");
            else if (status.Equals("ATIVO", StringComparison.OrdinalIgnoreCase))
                usuarios = usuarios.Where(u => u.Ativo && u.StatusConta == "ATIVA");
        }

        return usuarios.Select(u => MapearUsuario(u));
    }

    public async Task<AdminUsuarioResponse?> ObterUsuarioPorIdAsync(int id)
    {
        var usuario = await _usuarioRepository.ObterPorIdAsync(id);
        if (usuario == null) return null;
        return MapearUsuario(usuario);
    }

    public async Task<AdminUsuarioResponse> AtualizarUsuarioAsync(int id, AtualizarUsuarioAdminRequest request)
    {
        var usuario = await _usuarioRepository.ObterPorIdAsync(id);
        if (usuario == null)
            throw new KeyNotFoundException($"Usuário {id} não encontrado.");

        if (!string.IsNullOrWhiteSpace(request.Nome))
            usuario.Nome = request.Nome.Trim();

        if (!string.IsNullOrWhiteSpace(request.Email))
            usuario.Email = request.Email.Trim();

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            if (request.Status.Equals("BLOQUEADO", StringComparison.OrdinalIgnoreCase))
            {
                usuario.Ativo = false;
                usuario.StatusConta = "BLOQUEADA";
            }
            else if (request.Status.Equals("ATIVO", StringComparison.OrdinalIgnoreCase))
            {
                usuario.Ativo = true;
                usuario.StatusConta = "ATIVA";
            }
        }

        usuario.AtualizadoEm = DateTime.UtcNow;
        await _usuarioRepository.AtualizarAsync(usuario);

        return MapearUsuario(usuario);
    }

    public async Task BloquearUsuarioAsync(int id, string motivo, int adminId)
    {
        await _adminRepository.BloquearUsuarioAsync(id, motivo, adminId);
    }

    public async Task DesbloquearUsuarioAsync(int id, int adminId)
    {
        await _adminRepository.DesbloquearUsuarioAsync(id, adminId);
    }

    public async Task<IEnumerable<AdminRoleResponse>> ListarRolesAsync()
    {
        var roles = await _roleRepository.ListarAsync();
        var lista = new List<AdminRoleResponse>();

        foreach (var r in roles)
        {
            var perms = await _roleRepository.ObterPermissoesDaRoleAsync(r.Id);
            lista.Add(new AdminRoleResponse(
                r.Id.ToString(),
                r.Nome,
                r.Descricao ?? "",
                perms.Select(p => p.Nome).ToList()
            ));
        }

        return lista;
    }

    public async Task AtribuirRoleAsync(int usuarioId, int roleId)
    {
        await _usuarioRepository.AdicionarRoleAsync(usuarioId, roleId);
    }

    public async Task RemoverRoleAsync(int usuarioId, int roleId)
    {
        await _usuarioRepository.RemoverRoleAsync(usuarioId, roleId);
    }

    public async Task<IEnumerable<AdminDocumentoResponse>> ListarDocumentosPendentesAsync()
    {
        var docs = await _adminRepository.ListarDocumentosPendentesAsync();
        return docs.Select(d => new AdminDocumentoResponse(
            d.Id.ToString(),
            d.PrestadorId.ToString(),
            d.Prestador?.Usuario?.Nome ?? d.Prestador?.NomeFantasia ?? "Prestador",
            "PRESTADOR",
            d.TipoDocumento,
            d.SubmetidoEm.ToString("o"),
            d.Status,
            d.MotivoRejeicao
        ));
    }

    public async Task AprovarDocumentoAsync(int documentoId, int adminId)
    {
        await _adminRepository.AprovarDocumentoAsync(documentoId, adminId);
    }

    public async Task RejeitarDocumentoAsync(int documentoId, string motivo, int adminId)
    {
        await _adminRepository.RejeitarDocumentoAsync(documentoId, motivo, adminId);
    }

    public async Task<IEnumerable<AdminDenunciaResponse>> ListarDenunciasAsync()
    {
        var denuncias = await _adminRepository.ListarDenunciasAsync();
        return denuncias.Select(d => new AdminDenunciaResponse(
            d.Id.ToString(),
            d.UsuarioDenunciante?.Nome ?? "Denunciante",
            d.UsuarioDenunciadoId.ToString(),
            d.UsuarioDenunciado?.Nome ?? "Denunciado",
            d.Motivo,
            d.Descricao ?? "",
            d.CriadoEm.ToString("o"),
            d.Status,
            d.Resultado
        ));
    }

    public async Task ModerarDenunciaAsync(int denunciaId, string acao, string? observacao, int adminId)
    {
        await _adminRepository.ModerarDenunciaAsync(denunciaId, acao, observacao ?? "", adminId);
    }

    private static AdminUsuarioResponse MapearUsuario(Usuario u)
    {
        var rolesNomes = u.UsuarioRoles?.Select(ur => ur.Role?.Nome ?? ur.RoleId.ToString()).ToList() ?? new List<string>();
        var tipo = u.Perfil?.ToUpper() ?? "CLIENTE";
        var status = (!u.Ativo || u.StatusConta == "BLOQUEADA") ? "BLOQUEADO" : (u.StatusConta == "PENDENTE" ? "PENDENTE" : "ATIVO");

        return new AdminUsuarioResponse(
            u.Id.ToString(),
            u.Nome,
            u.Email,
            "",
            "",
            tipo,
            status,
            u.CriadoEm.ToString("o"),
            rolesNomes
        );
    }
}
