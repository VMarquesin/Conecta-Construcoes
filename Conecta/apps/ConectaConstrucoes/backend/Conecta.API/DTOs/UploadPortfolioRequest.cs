using Microsoft.AspNetCore.Http;

namespace Conecta.API.DTOs;

/// <summary>
/// DTO para encapsular os campos de multipart/form-data no upload de imagem do portfólio.
/// </summary>
public class UploadPortfolioRequest
{
    public IFormFile? File { get; set; }
    public int? PrestadorId { get; set; }
    public string? Titulo { get; set; }
    public string? Detalhe { get; set; }
}
