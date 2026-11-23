using Conecta.Application.DTOs;
using Conecta.Domain.Entidades;
using Conecta.Domain.Interfaces;

namespace Conecta.Application.Servicos;

public class PermissaoService : IPermissaoService
{
    private readonly IPermissaoRepository _permissaoRepository;

    public PermissaoService(IPermissaoRepository permissaoRepository)
    {
        _permissaoRepository = permissaoRepository;
    }

    public async Task<PermissaoResponse?> ObterPorIdAsync(int id)
    {
        var perm = await _permissaoRepository.ObterPorIdAsync(id);
        return perm == null ? null : MapearParaResponse(perm);
    }

    public async Task<IEnumerable<PermissaoResponse>> ListarAsync(string? recurso = null)
    {
        var permissoes = await _permissaoRepository.ListarAsync(recurso);
        return permissoes.Select(MapearParaResponse);
    }

    public async Task<PermissaoResponse> CriarAsync(CriarPermissaoRequest request)
    {
        var nomeFormatado = request.Nome.Trim().ToUpper();
        var existente = await _permissaoRepository.ObterPorNomeAsync(nomeFormatado);
        if (existente != null)
        {
            throw new InvalidOperationException($"Já existe uma permissão com o nome '{nomeFormatado}'.");
        }

        var permissao = new Permissao
        {
            Nome = nomeFormatado,
            Descricao = request.Descricao?.Trim(),
            Recurso = request.Recurso?.Trim().ToUpper(),
            Acao = request.Acao?.Trim().ToUpper()
        };

        var criada = await _permissaoRepository.AdicionarAsync(permissao);
        return MapearParaResponse(criada);
    }

    public async Task<IEnumerable<string>> ObterPermissoesDoUsuarioAsync(int usuarioId)
    {
        var permissoes = await _permissaoRepository.ObterPermissoesDoUsuarioAsync(usuarioId);
        return permissoes.Select(p => p.Nome);
    }

    private static PermissaoResponse MapearParaResponse(Permissao p)
    {
        return new PermissaoResponse(
            p.Id,
            p.Nome,
            p.Descricao,
            p.Recurso,
            p.Acao,
            p.CriadoEm
        );
    }
}
