using Conecta.Application.DTOs;
using Conecta.Domain.Entidades;
using Conecta.Domain.Interfaces;

namespace Conecta.Application.Servicos;

public class RoleService : IRoleService
{
    private readonly IRoleRepository _roleRepository;
    private readonly IPermissaoRepository _permissaoRepository;

    public RoleService(IRoleRepository roleRepository, IPermissaoRepository permissaoRepository)
    {
        _roleRepository = roleRepository;
        _permissaoRepository = permissaoRepository;
    }

    public async Task<RoleResponse?> ObterPorIdAsync(int id)
    {
        var role = await _roleRepository.ObterPorIdAsync(id);
        return role == null ? null : MapearParaResponse(role);
    }

    public async Task<IEnumerable<RoleResponse>> ListarAsync(bool apenasAtivos = false)
    {
        var roles = await _roleRepository.ListarAsync(apenasAtivos);
        return roles.Select(MapearParaResponse);
    }

    public async Task<RoleResponse> CriarAsync(CriarRoleRequest request)
    {
        var nomeFormatado = request.Nome.Trim().ToUpper();
        var existente = await _roleRepository.ObterPorNomeAsync(nomeFormatado);
        if (existente != null)
        {
            throw new InvalidOperationException($"Já existe um papel/role com o nome '{nomeFormatado}'.");
        }

        var role = new Role
        {
            Nome = nomeFormatado,
            Descricao = request.Descricao?.Trim(),
            Ativo = request.Ativo
        };

        var criada = await _roleRepository.AdicionarAsync(role);

        if (request.PermissoesIds != null && request.PermissoesIds.Any())
        {
            foreach (var permId in request.PermissoesIds)
            {
                var perm = await _permissaoRepository.ObterPorIdAsync(permId);
                if (perm != null)
                {
                    await _roleRepository.AdicionarPermissaoAsync(criada.Id, perm.Id);
                }
            }
        }

        var recarregada = await _roleRepository.ObterPorIdAsync(criada.Id);
        return MapearParaResponse(recarregada ?? criada);
    }

    public async Task<RoleResponse> AtualizarAsync(int id, AtualizarRoleRequest request)
    {
        var role = await _roleRepository.ObterPorIdAsync(id)
            ?? throw new KeyNotFoundException($"Role com ID {id} não encontrada.");

        role.Descricao = request.Descricao?.Trim();
        role.Ativo = request.Ativo;

        await _roleRepository.AtualizarAsync(role);
        return MapearParaResponse(role);
    }

    public async Task RemoverAsync(int id)
    {
        var role = await _roleRepository.ObterPorIdAsync(id)
            ?? throw new KeyNotFoundException($"Role com ID {id} não encontrada.");

        // Proteção para não excluir papéis essenciais do sistema
        var rolesImutaveis = new[] { "ADMIN_MASTER", "CLIENTE", "PRESTADOR" };
        if (rolesImutaveis.Contains(role.Nome))
        {
            throw new InvalidOperationException($"O papel de sistema '{role.Nome}' não pode ser removido.");
        }

        await _roleRepository.RemoverAsync(role);
    }

    public async Task AssociarPermissaoAsync(int roleId, int permissaoId)
    {
        var role = await _roleRepository.ObterPorIdAsync(roleId)
            ?? throw new KeyNotFoundException($"Role com ID {roleId} não encontrada.");

        var permissao = await _permissaoRepository.ObterPorIdAsync(permissaoId)
            ?? throw new KeyNotFoundException($"Permissão com ID {permissaoId} não encontrada.");

        await _roleRepository.AdicionarPermissaoAsync(roleId, permissaoId);
    }

    public async Task RemoverPermissaoAsync(int roleId, int permissaoId)
    {
        var role = await _roleRepository.ObterPorIdAsync(roleId)
            ?? throw new KeyNotFoundException($"Role com ID {roleId} não encontrada.");

        var permissao = await _permissaoRepository.ObterPorIdAsync(permissaoId)
            ?? throw new KeyNotFoundException($"Permissão com ID {permissaoId} não encontrada.");

        await _roleRepository.RemoverPermissaoAsync(roleId, permissaoId);
    }

    public async Task<IEnumerable<string>> ObterPermissoesAsync(int roleId)
    {
        var permissoes = await _roleRepository.ObterPermissoesDaRoleAsync(roleId);
        return permissoes.Select(p => p.Nome);
    }

    private static RoleResponse MapearParaResponse(Role r)
    {
        var perms = r.RolePermissoes?
            .Where(rp => rp.Permissao != null)
            .Select(rp => rp.Permissao!.Nome)
            .ToList() ?? new List<string>();

        return new RoleResponse(
            r.Id,
            r.Nome,
            r.Descricao,
            r.Ativo,
            r.CriadoEm,
            perms
        );
    }
}
