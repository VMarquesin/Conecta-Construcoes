using System.Security.Claims;
using Conecta.API.DTOs;
using Conecta.Application.DTOs;
using Conecta.Domain.Entidades;
using Conecta.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Conecta.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Route("api/[controller]")]
[Produces("application/json")]
public class PortfolioController : ControllerBase
{
    private readonly IPrestadorRepository _prestadorRepository;
    private readonly IWebHostEnvironment _environment;

    public PortfolioController(IPrestadorRepository prestadorRepository, IWebHostEnvironment environment)
    {
        _prestadorRepository = prestadorRepository;
        _environment = environment;
    }

    /// <summary>
    /// Realiza upload de imagem para o portfólio do prestador e salva no banco de dados (Requisito CON_019).
    /// </summary>
    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(UploadPortfolioResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Upload(
        [FromForm] UploadPortfolioRequest request,
        [FromQuery] int? queryPrestadorId = null)
    {
        if (request?.File == null || request.File.Length == 0)
        {
            return BadRequest(new { mensagem = "Nenhum arquivo de imagem foi enviado." });
        }

        var file = request.File;
        var prestadorId = request.PrestadorId;
        var titulo = request.Titulo;
        var detalhe = request.Detalhe;

        // Obtém o PrestadorId via Claim ou parâmetro
        var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        int idFinal = 0;
        if (int.TryParse(claimId, out var parsedId))
            idFinal = parsedId;
        else if (prestadorId.HasValue && prestadorId.Value > 0)
            idFinal = prestadorId.Value;
        else if (queryPrestadorId.HasValue && queryPrestadorId.Value > 0)
            idFinal = queryPrestadorId.Value;

        if (idFinal == 0)
        {
            return Unauthorized(new { mensagem = "Prestador não identificado para o upload." });
        }

        // Valida se o prestador existe
        var prestador = await _prestadorRepository.ObterPorUsuarioIdAsync(idFinal);
        if (prestador == null)
        {
            return NotFound(new { mensagem = $"Prestador com ID #{idFinal} não encontrado." });
        }

        // Pasta física wwwroot/uploads/portfolio
        var webRoot = _environment.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRoot))
        {
            webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        }

        var uploadsFolder = Path.Combine(webRoot, "uploads", "portfolio");
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        // Nome único com Guid + extensão original
        var extensao = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(extensao))
        {
            extensao = ".jpg";
        }
        var nomeArquivo = $"{Guid.NewGuid()}{extensao}";
        var caminhoFisico = Path.Combine(uploadsFolder, nomeArquivo);

        using (var stream = new FileStream(caminhoFisico, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var urlRelativa = $"/uploads/portfolio/{nomeArquivo}";

        // Salva a entidade de Portfolio no banco de dados
        var portfolio = new Portfolio
        {
            PrestadorId = idFinal,
            Titulo = !string.IsNullOrWhiteSpace(titulo) ? titulo.Trim() : "Trabalho Realizado",
            Descricao = !string.IsNullOrWhiteSpace(detalhe) ? detalhe.Trim() : "Serviço com padrão de qualidade",
            Destaque = true,
            CriadoEm = DateTime.UtcNow,
            AtualizadoEm = DateTime.UtcNow
        };

        portfolio.Imagens.Add(new PortfolioImagem
        {
            ImagemUrl = urlRelativa,
            Ordem = 1,
            CriadoEm = DateTime.UtcNow
        });

        var criado = await _prestadorRepository.AdicionarPortfolioAsync(portfolio);

        // URL completa com esquema e host
        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var urlCompleta = $"{baseUrl}{urlRelativa}";

        var resposta = new UploadPortfolioResponse(
            Id: criado.Id,
            Url: urlCompleta,
            ImagemUrl: urlRelativa,
            Titulo: criado.Titulo,
            Detalhe: criado.Descricao,
            PrestadorId: idFinal
        );

        return Ok(resposta);
    }

    /// <summary>
    /// Remove um item de portfólio pelo ID (Requisito CON_019).
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Deletar(int id, [FromQuery] int? prestadorId = null)
    {
        var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        int idFinal = 0;
        if (int.TryParse(claimId, out var parsedId))
            idFinal = parsedId;
        else if (prestadorId.HasValue && prestadorId.Value > 0)
            idFinal = prestadorId.Value;

        if (idFinal == 0)
        {
            return Unauthorized(new { mensagem = "Prestador não identificado." });
        }

        await _prestadorRepository.RemoverPortfolioAsync(idFinal, id);
        return Ok(new { mensagem = "Item de portfólio removido com sucesso." });
    }
}
