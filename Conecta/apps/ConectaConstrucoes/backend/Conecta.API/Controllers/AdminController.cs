using System.Security.Claims;
using Conecta.Application.DTOs;
using Conecta.Application.Servicos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Conecta.API.Controllers;

[ApiController]
[Route("admin")]
[Route("api/v1/admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    private int ObterAdminId()
    {
        var idStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(idStr, out var id) ? id : 1;
    }

    /// <summary>
    /// Retorna os indicadores e resumo estatístico para o Dashboard do Administrador.
    /// </summary>
    [HttpGet("resumo")]
    public async Task<IActionResult> ObterResumo()
    {
        var resumo = await _adminService.ObterResumoAsync();
        return Ok(resumo);
    }

    /// <summary>
    /// Lista usuários da plataforma com suporte a filtros de busca, tipo de perfil e status.
    /// </summary>
    [HttpGet("usuarios")]
    public async Task<IActionResult> ListarUsuarios(
        [FromQuery] string? busca,
        [FromQuery] string? tipo,
        [FromQuery] string? status)
    {
        var usuarios = await _adminService.ListarUsuariosAsync(busca, tipo, status);
        return Ok(usuarios);
    }

    /// <summary>
    /// Obtém detalhes completos de um usuário específico para o painel admin.
    /// </summary>
    [HttpGet("usuarios/{id}")]
    public async Task<IActionResult> ObterUsuario(int id)
    {
        var usuario = await _adminService.ObterUsuarioPorIdAsync(id);
        if (usuario == null)
            return NotFound(new { mensagem = $"Usuário {id} não encontrado." });

        return Ok(usuario);
    }

    /// <summary>
    /// Atualiza dados cadastrais ou status de um usuário diretamente pelo painel administrativo.
    /// </summary>
    [HttpPut("usuarios/{id}")]
    public async Task<IActionResult> AtualizarUsuario(int id, [FromBody] AtualizarUsuarioAdminRequest request)
    {
        try
        {
            var atualizado = await _adminService.AtualizarUsuarioAsync(id, request);
            return Ok(atualizado);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
    }

    /// <summary>
    /// Bloqueia preventivamente a conta de um usuário com registro de auditoria e justificativa.
    /// </summary>
    [HttpPost("usuarios/{id}/bloqueio")]
    public async Task<IActionResult> BloquearUsuario(int id, [FromBody] BloquearUsuarioAdminRequest request)
    {
        var adminId = ObterAdminId();
        await _adminService.BloquearUsuarioAsync(id, request.Motivo, adminId);
        return Ok(new { mensagem = "Usuário bloqueado com sucesso." });
    }

    /// <summary>
    /// Remove o bloqueio de uma conta de usuário permitindo o retorno de seu acesso.
    /// </summary>
    [HttpDelete("usuarios/{id}/bloqueio")]
    public async Task<IActionResult> DesbloquearUsuario(int id)
    {
        var adminId = ObterAdminId();
        await _adminService.DesbloquearUsuarioAsync(id, adminId);
        return Ok(new { mensagem = "Usuário desbloqueado com sucesso." });
    }

    /// <summary>
    /// Lista todos os papéis (roles) e permissões de sistema disponíveis para atribuição.
    /// </summary>
    [HttpGet("roles")]
    public async Task<IActionResult> ListarRoles()
    {
        var roles = await _adminService.ListarRolesAsync();
        return Ok(roles);
    }

    /// <summary>
    /// Atribui um papel funcional (RBAC) a um usuário específico.
    /// </summary>
    [HttpPut("usuarios/{usuarioId}/roles/{roleId}")]
    public async Task<IActionResult> AtribuirRole(int usuarioId, int roleId)
    {
        await _adminService.AtribuirRoleAsync(usuarioId, roleId);
        return Ok(new { mensagem = "Papel atribuído com sucesso." });
    }

    /// <summary>
    /// Remove um papel funcional (RBAC) de um usuário.
    /// </summary>
    [HttpDelete("usuarios/{usuarioId}/roles/{roleId}")]
    public async Task<IActionResult> RemoverRole(int usuarioId, int roleId)
    {
        await _adminService.RemoverRoleAsync(usuarioId, roleId);
        return Ok(new { mensagem = "Papel removido com sucesso." });
    }

    /// <summary>
    /// Lista documentos submetidos por prestadores pendentes de análise e verificação.
    /// </summary>
    [HttpGet("documentos")]
    public async Task<IActionResult> ListarDocumentosPendentes([FromQuery] string? status)
    {
        var documentos = await _adminService.ListarDocumentosPendentesAsync();
        return Ok(documentos);
    }

    /// <summary>
    /// Aprova um documento do prestador, conferindo o status de verificado na plataforma.
    /// </summary>
    [HttpPost("documentos/{id}/aprovacao")]
    public async Task<IActionResult> AprovarDocumento(int id)
    {
        var adminId = ObterAdminId();
        await _adminService.AprovarDocumentoAsync(id, adminId);
        return Ok(new { mensagem = "Documento aprovado com sucesso." });
    }

    /// <summary>
    /// Rejeita um documento submetido pelo prestador registrando o motivo para correção.
    /// </summary>
    [HttpPost("documentos/{id}/rejeicao")]
    public async Task<IActionResult> RejeitarDocumento(int id, [FromBody] RejeitarDocumentoRequest request)
    {
        var adminId = ObterAdminId();
        await _adminService.RejeitarDocumentoAsync(id, request.Motivo, adminId);
        return Ok(new { mensagem = "Documento rejeitado com sucesso." });
    }

    /// <summary>
    /// Lista denúncias registradas por usuários para análise e moderação da equipe.
    /// </summary>
    [HttpGet("denuncias")]
    public async Task<IActionResult> ListarDenuncias()
    {
        var denuncias = await _adminService.ListarDenunciasAsync();
        return Ok(denuncias);
    }

    /// <summary>
    /// Modera uma denúncia aplicando a ação cabível (ARQUIVAR, ADVERTIR, RESOLVIDA, BANIDO).
    /// </summary>
    [HttpPost("denuncias/{id}/moderacao")]
    public async Task<IActionResult> ModerarDenuncia(int id, [FromBody] ModerarDenunciaRequest request)
    {
        var adminId = ObterAdminId();
        await _adminService.ModerarDenunciaAsync(id, request.Acao, request.Observacao, adminId);
        return Ok(new { mensagem = "Denúncia moderada com sucesso." });
    }
}
