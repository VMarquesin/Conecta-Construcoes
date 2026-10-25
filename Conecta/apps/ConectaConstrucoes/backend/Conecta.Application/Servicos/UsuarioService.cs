using Conecta.Application.DTOs;
using Conecta.Application.Servicos.Seguranca;
using Conecta.Domain.Entidades;
using Conecta.Domain.Interfaces;

namespace Conecta.Application.Servicos;

public class UsuarioService : IUsuarioService
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService? _tokenService;

    public UsuarioService(
        IUsuarioRepository usuarioRepository,
        IRoleRepository roleRepository,
        IPasswordHasher passwordHasher,
        ITokenService? tokenService = null)
    {
        _usuarioRepository = usuarioRepository;
        _roleRepository = roleRepository;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    public async Task<UsuarioResponse?> ObterPorIdAsync(int id)
    {
        var usuario = await _usuarioRepository.ObterPorIdAsync(id);
        return usuario == null ? null : MapearParaResponse(usuario);
    }

    public async Task<UsuarioResponse?> ObterPorEmailAsync(string email)
    {
        var usuario = await _usuarioRepository.ObterPorEmailAsync(email);
        return usuario == null ? null : MapearParaResponse(usuario);
    }

    public async Task<UsuarioPaginadoResponse> ListarAsync(int pagina = 1, int tamanhoPagina = 20, string? busca = null)
    {
        if (pagina < 1) pagina = 1;
        if (tamanhoPagina < 1 || tamanhoPagina > 100) tamanhoPagina = 20;

        var total = await _usuarioRepository.ContarAsync(busca);
        var usuarios = await _usuarioRepository.ListarAsync(pagina, tamanhoPagina, busca);

        var itens = usuarios.Select(MapearParaResponse);
        return new UsuarioPaginadoResponse(itens, total, pagina, tamanhoPagina);
    }

    public async Task<UsuarioResponse> CriarAsync(CriarUsuarioRequest request)
    {
        var existente = await _usuarioRepository.ObterPorEmailAsync(request.Email);
        if (existente != null)
        {
            throw new InvalidOperationException($"Já existe um usuário cadastrado com o e-mail '{request.Email}'.");
        }

        var senhaHash = _passwordHasher.Hash(request.Senha);
        var usuario = new Usuario
        {
            Nome = request.Nome.Trim(),
            Email = request.Email.Trim().ToLower(),
            SenhaHash = senhaHash,
            Tipo = string.IsNullOrWhiteSpace(request.Tipo) ? "CLIENTE" : request.Tipo.ToUpper(),
            StatusConta = "ATIVA",
            StatusVerificacao = "COMPLETO"
        };

        var criado = await _usuarioRepository.AdicionarAsync(usuario);

        // Associar roles iniciais
        if (request.RolesIniciais != null && request.RolesIniciais.Any())
        {
            foreach (var roleNome in request.RolesIniciais)
            {
                var role = await _roleRepository.ObterPorNomeAsync(roleNome);
                if (role != null)
                {
                    await _usuarioRepository.AdicionarRoleAsync(criado.Id, role.Id);
                }
            }
        }
        else
        {
            // Atribui role padrão baseada no tipo (ex: CLIENTE ou PRESTADOR)
            var rolePadrao = await _roleRepository.ObterPorNomeAsync(usuario.Tipo);
            if (rolePadrao != null)
            {
                await _usuarioRepository.AdicionarRoleAsync(criado.Id, rolePadrao.Id);
            }
        }

        var recarregado = await _usuarioRepository.ObterPorIdAsync(criado.Id);
        return MapearParaResponse(recarregado ?? criado);
    }

    public async Task<RegistroUsuarioResponse> RegistrarAsync(RegistroUsuarioRequest request)
    {
        var existente = await _usuarioRepository.ObterPorEmailAsync(request.Email);
        if (existente != null)
        {
            throw new InvalidOperationException($"Já existe um usuário cadastrado com o e-mail '{request.Email}'.");
        }

        var perfilNormalizado = string.IsNullOrWhiteSpace(request.Perfil)
            ? "CLIENTE"
            : request.Perfil.Trim().ToUpper();

        var senhaHash = _passwordHasher.Hash(request.Senha);
        var usuario = new Usuario
        {
            Nome = request.Nome.Trim(),
            Email = request.Email.Trim().ToLower(),
            SenhaHash = senhaHash,
            Perfil = perfilNormalizado,
            Documento = request.Documento?.Trim(),
            StatusConta = "ATIVA",
            StatusVerificacao = "COMPLETO"
        };

        var criado = await _usuarioRepository.AdicionarAsync(usuario);

        // Atribuir Role padrão (CLIENTE ou PRESTADOR)
        var role = await _roleRepository.ObterPorNomeAsync(perfilNormalizado);
        if (role != null)
        {
            await _usuarioRepository.AdicionarRoleAsync(criado.Id, role.Id);
        }

        // Criar registro de perfil correspondente
        if (perfilNormalizado == "PRESTADOR")
        {
            var prestador = new Prestador
            {
                UsuarioId = criado.Id,
                NomeFantasia = request.DadosPrestador?.NomeFantasia?.Trim() ?? request.Nome.Trim(),
                Bio = request.DadosPrestador?.Bio?.Trim(),
                ExperienciaAnos = request.DadosPrestador?.ExperienciaAnos,
                ValorHoraInicial = request.DadosPrestador?.ValorHoraInicial,
                RaioAtendimentoKm = request.DadosPrestador?.RaioAtendimentoKm ?? 15,
                Latitude = request.Endereco?.Latitude ?? 0,
                Longitude = request.Endereco?.Longitude ?? 0,
                StatusDisponibilidade = "DISPONIVEL"
            };
            await _usuarioRepository.AdicionarPrestadorAsync(prestador);
        }
        else
        {
            var cliente = new Cliente
            {
                UsuarioId = criado.Id,
                Ativo = true
            };
            await _usuarioRepository.AdicionarClienteAsync(cliente);
        }

        // Telefone
        if (!string.IsNullOrWhiteSpace(request.Telefone))
        {
            var telefone = new Telefone
            {
                UsuarioId = criado.Id,
                Numero = request.Telefone.Trim(),
                Principal = true,
                Tipo = "WHATSAPP"
            };
            await _usuarioRepository.AdicionarTelefoneAsync(telefone);
        }

        // Endereço
        if (request.Endereco != null)
        {
            var cidade = await _usuarioRepository.ObterOuCriarCidadeAsync(
                request.Endereco.Cidade,
                request.Endereco.Estado
            );

            var endereco = new Endereco
            {
                UsuarioId = criado.Id,
                CidadeId = cidade.Id,
                Bairro = request.Endereco.Bairro?.Trim(),
                Cep = request.Endereco.Cep?.Trim(),
                Logradouro = request.Endereco.Logradouro?.Trim() ?? "",
                Numero = request.Endereco.Numero?.Trim() ?? "S/N",
                Complemento = request.Endereco.Complemento?.Trim(),
                CidadeNome = request.Endereco.Cidade?.Trim() ?? "",
                EstadoSigla = request.Endereco.Estado?.Trim().ToUpper() ?? "SP",
                Latitude = request.Endereco.Latitude,
                Longitude = request.Endereco.Longitude,
                Principal = true
            };
            await _usuarioRepository.AdicionarEnderecoAsync(endereco);
        }

        var rolesList = new List<string> { perfilNormalizado };
        var expiracao = DateTime.UtcNow.AddHours(24);
        var token = _tokenService != null
            ? _tokenService.GerarToken(criado, rolesList, new List<string>())
            : string.Empty;

        return new RegistroUsuarioResponse(
            criado.Id,
            criado.Nome,
            criado.Email,
            criado.Perfil,
            token,
            expiracao,
            rolesList
        );
    }

    public async Task<UsuarioResponse> AtualizarAsync(int id, AtualizarUsuarioRequest request)
    {
        var usuario = await _usuarioRepository.ObterPorIdAsync(id)
            ?? throw new KeyNotFoundException($"Usuário com ID {id} não encontrado.");

        var existente = await _usuarioRepository.ObterPorEmailAsync(request.Email);
        if (existente != null && existente.Id != id)
        {
            throw new InvalidOperationException($"O e-mail '{request.Email}' já está sendo utilizado por outro usuário.");
        }

        usuario.Nome = request.Nome.Trim();
        usuario.Email = request.Email.Trim().ToLower();

        if (!string.IsNullOrWhiteSpace(request.StatusConta))
            usuario.StatusConta = request.StatusConta.ToUpper();

        if (!string.IsNullOrWhiteSpace(request.StatusVerificacao))
            usuario.StatusVerificacao = request.StatusVerificacao.ToUpper();

        await _usuarioRepository.AtualizarAsync(usuario);

        return MapearParaResponse(usuario);
    }

    public async Task AlterarSenhaAsync(int id, AlterarSenhaRequest request)
    {
        var usuario = await _usuarioRepository.ObterPorIdAsync(id)
            ?? throw new KeyNotFoundException($"Usuário com ID {id} não encontrado.");

        if (!_passwordHasher.Verify(request.SenhaAtual, usuario.SenhaHash))
        {
            throw new UnauthorizedAccessException("A senha atual informada está incorreta.");
        }

        usuario.SenhaHash = _passwordHasher.Hash(request.NovaSenha);
        await _usuarioRepository.AtualizarAsync(usuario);
    }

    public async Task RemoverAsync(int id)
    {
        var usuario = await _usuarioRepository.ObterPorIdAsync(id)
            ?? throw new KeyNotFoundException($"Usuário com ID {id} não encontrado.");

        await _usuarioRepository.RemoverAsync(usuario);
    }

    public async Task AssociarRoleAsync(int usuarioId, int roleId)
    {
        var usuario = await _usuarioRepository.ObterPorIdAsync(usuarioId)
            ?? throw new KeyNotFoundException($"Usuário com ID {usuarioId} não encontrado.");

        var role = await _roleRepository.ObterPorIdAsync(roleId)
            ?? throw new KeyNotFoundException($"Role com ID {roleId} não encontrada.");

        await _usuarioRepository.AdicionarRoleAsync(usuarioId, roleId);
    }

    public async Task RemoverRoleAsync(int usuarioId, int roleId)
    {
        var usuario = await _usuarioRepository.ObterPorIdAsync(usuarioId)
            ?? throw new KeyNotFoundException($"Usuário com ID {usuarioId} não encontrado.");

        var role = await _roleRepository.ObterPorIdAsync(roleId)
            ?? throw new KeyNotFoundException($"Role com ID {roleId} não encontrada.");

        await _usuarioRepository.RemoverRoleAsync(usuarioId, roleId);
    }

    public async Task<IEnumerable<string>> ObterRolesAsync(int usuarioId)
    {
        var roles = await _usuarioRepository.ObterRolesDoUsuarioAsync(usuarioId);
        return roles.Select(r => r.Nome);
    }

    private static UsuarioResponse MapearParaResponse(Usuario u)
    {
        var roles = u.UsuarioRoles?
            .Where(ur => ur.Role != null)
            .Select(ur => ur.Role!.Nome)
            .ToList() ?? new List<string>();

        return new UsuarioResponse(
            u.Id,
            u.Nome,
            u.Email,
            u.Tipo,
            u.StatusVerificacao,
            u.StatusConta,
            u.UltimoAcessoEm,
            u.CriadoEm,
            u.AtualizadoEm,
            roles
        );
    }
}
