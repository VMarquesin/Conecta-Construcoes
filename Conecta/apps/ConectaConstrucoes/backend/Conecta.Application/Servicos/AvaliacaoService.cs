using Conecta.Application.DTOs;
using Conecta.Domain.Entidades;
using Conecta.Domain.Enums;
using Conecta.Domain.Interfaces;

namespace Conecta.Application.Servicos;

public class AvaliacaoService : IAvaliacaoService
{
    private readonly IAvaliacaoRepository _avaliacaoRepository;
    private readonly IPedidoRepository _pedidoRepository;
    private readonly IUsuarioRepository _usuarioRepository;

    public AvaliacaoService(
        IAvaliacaoRepository avaliacaoRepository,
        IPedidoRepository pedidoRepository,
        IUsuarioRepository usuarioRepository)
    {
        _avaliacaoRepository = avaliacaoRepository;
        _pedidoRepository = pedidoRepository;
        _usuarioRepository = usuarioRepository;
    }

    public async Task<AvaliacaoResponse> CriarAvaliacaoAsync(int clienteId, CriarAvaliacaoRequest request)
    {
        if (request.Nota < 1 || request.Nota > 5)
            throw new ArgumentException("A nota de avaliação deve estar entre 1 e 5 estrelas.");

        var pedido = await _pedidoRepository.ObterPorIdAsync(request.PedidoId);
        if (pedido == null)
            throw new KeyNotFoundException($"Pedido de ID {request.PedidoId} não encontrado.");

        if (pedido.ClienteId != clienteId)
            throw new UnauthorizedAccessException("Apenas o cliente contratante deste pedido pode avaliá-lo.");

        // Regra de Negócio Crucial (CON_019): Avaliação restrita a pedidos concluídos
        if (pedido.Status != StatusPedido.CONCLUIDO)
            throw new InvalidOperationException($"Não é possível avaliar um pedido com status '{pedido.Status}'. A avaliação é permitida apenas após a conclusão do serviço.");

        // Regra de Unicidade: apenas 1 avaliação por pedido
        var avaliacaoExistente = await _avaliacaoRepository.ObterPorPedidoIdAsync(request.PedidoId);
        if (avaliacaoExistente != null)
            throw new InvalidOperationException("Este pedido já foi avaliado anteriormente.");

        var cliente = await _usuarioRepository.ObterPorIdAsync(clienteId);
        var clienteNome = cliente?.Nome ?? "Cliente";

        var novaAvaliacao = new Avaliacao
        {
            PedidoId = request.PedidoId,
            ClienteId = clienteId,
            PrestadorId = pedido.PrestadorId,
            Nota = request.Nota,
            Comentario = request.Comentario,
            DataCriacao = DateTime.UtcNow,
            AtualizadoEm = DateTime.UtcNow
        };

        var criada = await _avaliacaoRepository.AdicionarAsync(novaAvaliacao);

        return new AvaliacaoResponse(
            criada.Id,
            criada.PedidoId,
            criada.ClienteId,
            clienteNome,
            criada.PrestadorId,
            criada.Nota,
            criada.Comentario,
            criada.DataCriacao
        );
    }

    public async Task<IEnumerable<AvaliacaoResponse>> ListarAvaliacoesDoPrestadorAsync(int prestadorId)
    {
        var lista = await _avaliacaoRepository.ListarPorPrestadorAsync(prestadorId);
        return lista.Select(a => new AvaliacaoResponse(
            a.Id,
            a.PedidoId,
            a.ClienteId,
            a.Cliente?.Usuario?.Nome ?? "Cliente",
            a.PrestadorId,
            a.Nota,
            a.Comentario,
            a.DataCriacao
        ));
    }
}
