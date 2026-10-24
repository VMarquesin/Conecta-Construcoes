using Conecta.Application.DTOs;
using Conecta.Application.Servicos.Seguranca;
using Conecta.Domain.Interfaces;

namespace Conecta.Application.Servicos;

public class AuthService : IAuthService
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IPermissaoRepository _permissaoRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;

    public AuthService(
        IUsuarioRepository usuarioRepository,
        IPermissaoRepository permissaoRepository,
        IPasswordHasher passwordHasher,
        ITokenService tokenService)
    {
        _usuarioRepository = usuarioRepository;
        _permissaoRepository = permissaoRepository;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        var usuario = await _usuarioRepository.ObterPorEmailAsync(request.Email);
        if (usuario == null)
        {
            throw new UnauthorizedAccessException("Credenciais inválidas.");
        }

        if (usuario.StatusConta == "BLOQUEADA" || usuario.StatusConta == "SUSPENSA")
        {
            throw new UnauthorizedAccessException($"Conta do usuário está {usuario.StatusConta}.");
        }

        if (!_passwordHasher.Verify(request.Senha, usuario.SenhaHash))
        {
            throw new UnauthorizedAccessException("Credenciais inválidas.");
        }

        // Atualiza último acesso
        usuario.UltimoAcessoEm = DateTime.UtcNow;
        await _usuarioRepository.AtualizarAsync(usuario);

        var roles = usuario.UsuarioRoles?
            .Where(ur => ur.Role != null && ur.Role.Ativo)
            .Select(ur => ur.Role!.Nome)
            .ToList() ?? new List<string>();

        var permissoes = (await _permissaoRepository.ObterPermissoesDoUsuarioAsync(usuario.Id))
            .Select(p => p.Nome)
            .Distinct()
            .ToList();

        var token = _tokenService.GerarToken(usuario, roles, permissoes);

        var usuarioResponse = new UsuarioResponse(
            usuario.Id,
            usuario.Nome,
            usuario.Email,
            usuario.Tipo,
            usuario.StatusVerificacao,
            usuario.StatusConta,
            usuario.UltimoAcessoEm,
            usuario.CriadoEm,
            usuario.AtualizadoEm,
            roles
        );

        return new LoginResponse(
            token,
            DateTime.UtcNow.AddHours(24),
            usuarioResponse,
            permissoes
        );
    }
}
