namespace Conecta.Application.DTOs;

public record CategoriaResponse(
    int Id,
    string Nome,
    string Slug,
    string? Descricao,
    string? IconeUrl,
    bool Ativo
);

public record CriarCategoriaRequest(
    string Nome,
    string Slug,
    string? Descricao = null,
    string? IconeUrl = null
);
