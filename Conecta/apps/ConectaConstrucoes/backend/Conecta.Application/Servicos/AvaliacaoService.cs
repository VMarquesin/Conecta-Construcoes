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

        int prestadorId;
        Pedido? pedido = null;

        if (request.PedidoId.HasValue && request.PedidoId.Value > 0)
        {
            pedido = await _pedidoRepository.ObterPorIdAsync(request.PedidoId.Value);
            if (pedido == null)
                throw new KeyNotFoundException($"Pedido de ID {request.PedidoId.Value} não encontrado.");

            if (pedido.ClienteId != clienteId)
                throw new UnauthorizedAccessException("Apenas o cliente contratante deste pedido pode avaliá-lo.");

            prestadorId = pedido.PrestadorId;
        }
        else if (request.PrestadorId.HasValue && request.PrestadorId.Value > 0)
        {
            prestadorId = request.PrestadorId.Value;
        }
        else
        {
            throw new ArgumentException("PrestadorId ou PedidoId deve ser informado.");
        }

        // Validação 1: Apenas clientes com pelo menos um Pedido com Status == StatusPedido.CONCLUIDO com aquele prestador específico podem avaliar.
        var pedidosCliente = await _pedidoRepository.ListarPorUsuarioAsync(clienteId, "CONCLUIDO");
        var pedidosConcluidosPrestador = pedidosCliente
            .Where(p => p.ClienteId == clienteId && p.PrestadorId == prestadorId && p.Status == StatusPedido.CONCLUIDO)
            .ToList();

        var qtdPedidosConcluidos = pedidosConcluidosPrestador.Count;
        if (qtdPedidosConcluidos == 0)
        {
            throw new UnauthorizedAccessException("Apenas clientes com pelo menos um pedido concluído com este prestador podem avaliá-lo.");
        }

        // Validação 2: Regra de avaliações múltiplas para clientes recorrentes:
        // O cliente pode avaliar se a quantidade total de avaliações que ele já fez for MENOR que a quantidade total de pedidos concluídos.
        var avaliacoesDoPrestador = (await _avaliacaoRepository.ListarPorPrestadorAsync(prestadorId)).ToList();
        var avaliacoesDoCliente = avaliacoesDoPrestador.Where(a => a.ClienteId == clienteId).ToList();
        var qtdAvaliacoesCliente = avaliacoesDoCliente.Count;

        if (qtdAvaliacoesCliente >= qtdPedidosConcluidos)
        {
            throw new UnauthorizedAccessException("Você precisa de um novo serviço concluído para avaliar novamente.");
        }

        // Se pedido não veio explícito, seleciona o pedido concluído que ainda não foi avaliado
        if (pedido == null)
        {
            var pedidosAvaliadosIds = avaliacoesDoCliente.Select(a => a.PedidoId).ToHashSet();
            pedido = pedidosConcluidosPrestador
                .Where(p => !pedidosAvaliadosIds.Contains(p.Id))
                .OrderByDescending(p => p.DataConclusao ?? p.CriadoEm)
                .FirstOrDefault()
                ?? pedidosConcluidosPrestador.OrderByDescending(p => p.DataConclusao ?? p.CriadoEm).First();
        }
        else if (pedido.Status != StatusPedido.CONCLUIDO)
        {
            throw new UnauthorizedAccessException("Não é possível avaliar um pedido que ainda não foi concluído.");
        }

        var cliente = await _usuarioRepository.ObterPorIdAsync(clienteId);
        var clienteNome = cliente?.Nome ?? "Cliente";

        var novaAvaliacao = new Avaliacao
        {
            PedidoId = pedido.Id,
            ClienteId = clienteId,
            PrestadorId = prestadorId,
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

    public async Task<AvaliacaoResponse> AtualizarAvaliacaoAsync(int id, int clienteId, AtualizarAvaliacaoRequest request)
    {
        if (request.Nota < 1 || request.Nota > 5)
            throw new ArgumentException("A nota de avaliação deve estar entre 1 e 5 estrelas.");

        var avaliacao = await _avaliacaoRepository.ObterPorIdAsync(id);
        if (avaliacao == null)
            throw new KeyNotFoundException($"Avaliação de ID {id} não encontrada.");

        if (avaliacao.ClienteId != clienteId)
            throw new UnauthorizedAccessException("Apenas o autor pode editar esta avaliação.");

        // Validação de tempo: (DateTime.UtcNow - avaliacao.CriadoEm).TotalHours > 1
        var horasDecorridas = (DateTime.UtcNow - avaliacao.DataCriacao).TotalHours;
        if (horasDecorridas > 1)
        {
            throw new UnauthorizedAccessException("O tempo limite de 1 hora para edição/exclusão expirou.");
        }

        avaliacao.Nota = request.Nota;
        avaliacao.Comentario = request.Comentario;
        avaliacao.AtualizadoEm = DateTime.UtcNow;

        await _avaliacaoRepository.AtualizarAsync(avaliacao);

        var cliente = await _usuarioRepository.ObterPorIdAsync(clienteId);
        var clienteNome = cliente?.Nome ?? "Cliente";

        return new AvaliacaoResponse(
            avaliacao.Id,
            avaliacao.PedidoId,
            avaliacao.ClienteId,
            clienteNome,
            avaliacao.PrestadorId,
            avaliacao.Nota,
            avaliacao.Comentario,
            avaliacao.DataCriacao
        );
    }

    public async Task RemoverAvaliacaoAsync(int id, int clienteId)
    {
        var avaliacao = await _avaliacaoRepository.ObterPorIdAsync(id);
        if (avaliacao == null)
            throw new KeyNotFoundException($"Avaliação de ID {id} não encontrada.");

        if (avaliacao.ClienteId != clienteId)
            throw new UnauthorizedAccessException("Apenas o autor pode remover esta avaliação.");

        // Validação de tempo: (DateTime.UtcNow - avaliacao.CriadoEm).TotalHours > 1
        var horasDecorridas = (DateTime.UtcNow - avaliacao.DataCriacao).TotalHours;
        if (horasDecorridas > 1)
        {
            throw new UnauthorizedAccessException("O tempo limite de 1 hora para edição/exclusão expirou.");
        }

        await _avaliacaoRepository.RemoverAsync(avaliacao);
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
