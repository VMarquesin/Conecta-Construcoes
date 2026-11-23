using Conecta.Application.DTOs;

namespace Conecta.Application.Servicos;

public interface ICategoriaService
{
    Task<IEnumerable<CategoriaResponse>> ListarAtivasAsync();
    Task<IEnumerable<CategoriaResponse>> ListarTodasAsync();
    Task<CategoriaResponse?> ObterPorIdAsync(int id);
    Task<CategoriaResponse?> ObterPorSlugAsync(string slug);
}
