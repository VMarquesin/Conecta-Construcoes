using Conecta.Domain.Entidades;

namespace Conecta.Domain.Interfaces;

public interface ICategoriaRepository
{
    Task<IEnumerable<Categoria>> ListarAtivasAsync();
    Task<IEnumerable<Categoria>> ListarTodasAsync();
    Task<Categoria?> ObterPorIdAsync(int id);
    Task<Categoria?> ObterPorSlugAsync(string slug);
    Task<Categoria> AdicionarAsync(Categoria categoria);
    Task AtualizarAsync(Categoria categoria);
}
