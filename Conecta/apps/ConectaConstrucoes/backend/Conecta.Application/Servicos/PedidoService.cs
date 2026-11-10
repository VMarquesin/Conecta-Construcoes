using Conecta.Application.DTOs;
using Conecta.Domain.Entidades;
using Conecta.Domain.Enums;
using Conecta.Domain.Interfaces;

namespace Conecta.Application.Servicos;

public class PedidoService : IPedidoService
{
    private readonly IPedidoRepository _pedidoRepository;
    private readonly ISolicitacaoRepository _solicitacaoRepository;

    public PedidoService(
        IPedidoRepository pedidoRepository,
        ISolicitacaoRepository solicitacaoRepository)
    {
        _pedidoRepository = pedidoRepository;
        _solicitacaoRepository = solicitacaoRepository;
    }

    public async Task<IEnumerable<PedidoResumoResponse>> ListarMeusPedidosAsync(int usuarioId, string? status = null)
    {
        var dbStatus = status?.ToLower() switch
        {
            "pendente" => "AGUARDANDO_ACEITE",
            "aceito" => "AGENDADO",
            "concluido" => "CONCLUIDO",
            _ => null
        };

        var pedidos = await _pedidoRepository.ListarPorUsuarioAsync(usuarioId, dbStatus);

        var listaPedidos = pedidos.Select(p =>
        {
            var statusAba = p.Status switch
            {
                StatusPedido.AGUARDANDO_ACEITE => "pendente",
                StatusPedido.AGENDADO or StatusPedido.EM_EXECUCAO => "aceito",
                StatusPedido.CONCLUIDO => "concluido",
                _ => "pendente"
            };

            var statusTexto = p.Status switch
            {
                StatusPedido.AGUARDANDO_ACEITE => "Pendente",
                StatusPedido.AGENDADO => "Aceito",
                StatusPedido.EM_EXECUCAO => "Em Execução",
                StatusPedido.CONCLUIDO => "Concluído",
                StatusPedido.CANCELADO => "Cancelado",
                _ => p.Status.ToString()
            };

            var valorLabel = p.Status switch
            {
                StatusPedido.AGUARDANDO_ACEITE => "Orçamento Estimado",
                StatusPedido.AGENDADO or StatusPedido.EM_EXECUCAO => "Valor Fechado",
                StatusPedido.CONCLUIDO => "Valor Pago",
                _ => "Valor Previsto"
            };

            var valor = p.ValorFinal ?? p.ValorCombinado;
            var valorTexto = valor.HasValue ? $"R$ {valor.Value:F2}" : "A combinar";
            var valorIsPreco = valor.HasValue;

            var statusDica = p.Status switch
            {
                StatusPedido.AGUARDANDO_ACEITE => "Aguardando resposta",
                StatusPedido.AGENDADO => p.AgendadoPara.HasValue ? $"Agendado para {p.AgendadoPara.Value:dd/MM, HH:mm}" : "Agendamento confirmado",
                StatusPedido.EM_EXECUCAO => "Serviço em andamento",
                StatusPedido.CONCLUIDO => "Serviço finalizado com garantia Conecta",
                _ => "Cancelado"
            };

            var dicaIcone = p.Status switch
            {
                StatusPedido.AGUARDANDO_ACEITE => "clock",
                StatusPedido.AGENDADO => "calendar",
                StatusPedido.CONCLUIDO => "check",
                _ => "truck"
            };

            var prestadorNome = p.Prestador?.NomeFantasia ?? p.Prestador?.Usuario?.Nome ?? "Prestador";
            var prestadorAvatar = p.Prestador?.Usuario?.FotoPerfilUrl ?? p.Prestador?.CapaUrl ?? "";
            var prestadorProfissao = !string.IsNullOrWhiteSpace(p.Prestador?.NomeFantasia)
                ? p.Prestador.NomeFantasia
                : "Profissional Verificado";

            var podeAvaliar = p.Status == StatusPedido.CONCLUIDO && p.Avaliacao == null && p.ClienteId == usuarioId;
            var jaAvaliado = p.Avaliacao != null;

            return new PedidoResumoResponse(
                Id: p.Id,
                PrestadorId: p.PrestadorId,
                PrestadorNome: prestadorNome,
                PrestadorProfissao: prestadorProfissao,
                PrestadorAvatar: prestadorAvatar,
                SolicitadoEm: FormatarDataAmigavel(p.DataSolicitacao),
                Status: statusAba,
                StatusTexto: statusTexto,
                TituloServico: p.DescricaoNecessidade.Length > 50 ? p.DescricaoNecessidade[..50] + "..." : p.DescricaoNecessidade,
                DescricaoServico: p.DescricaoNecessidade,
                ValorLabel: valorLabel,
                ValorTexto: valorTexto,
                ValorIsPreco: valorIsPreco,
                StatusDica: statusDica,
                DicaIcone: dicaIcone,
                PodeAvaliar: podeAvaliar,
                JaAvaliado: jaAvaliado
            );
        }).ToList();

        // Se estiver listando todas ou pendentes, inclui também as solicitações abertas/aguardando proposta do cliente
        if (string.IsNullOrWhiteSpace(status) || status.Equals("pendente", StringComparison.OrdinalIgnoreCase))
        {
            var solicitacoes = await _solicitacaoRepository.ListarPorClienteAsync(usuarioId);
            var pendentes = solicitacoes
                .Where(s => s.Status == StatusSolicitacao.ABERTA || s.Status == StatusSolicitacao.AGUARDANDO_PROPOSTA || s.Status == StatusSolicitacao.CANCELADA)
                .Where(s => !listaPedidos.Any(p => p.Id == s.Id || p.TituloServico == s.Titulo))
                .Select(s =>
                {
                    var prestadorNome = s.Prestador?.NomeFantasia ?? s.Prestador?.Usuario?.Nome ?? "Prestador";
                    var prestadorAvatar = s.Prestador?.Usuario?.FotoPerfilUrl ?? s.Prestador?.CapaUrl ?? "";
                    var prestadorProfissao = !string.IsNullOrWhiteSpace(s.Prestador?.NomeFantasia)
                        ? s.Prestador.NomeFantasia
                        : (s.Categoria?.Nome ?? "Profissional Verificado");

                    var isCancelada = s.Status == StatusSolicitacao.CANCELADA;
                    var statusStr = isCancelada ? "CANCELADO" : "ABERTA";
                    var statusTexto = isCancelada ? "Cancelado" : "Orçamento Aberto";
                    var statusDica = isCancelada ? "Solicitação de orçamento cancelada" : "Solicitação enviada ao prestador";

                    return new PedidoResumoResponse(
                        Id: s.Id,
                        PrestadorId: s.PrestadorId,
                        PrestadorNome: prestadorNome,
                        PrestadorProfissao: prestadorProfissao,
                        PrestadorAvatar: prestadorAvatar,
                        SolicitadoEm: FormatarDataAmigavel(s.CriadoEm),
                        Status: statusStr,
                        StatusTexto: statusTexto,
                        TituloServico: s.Titulo,
                        DescricaoServico: s.Descricao,
                        ValorLabel: "Orçamento Estimado",
                        ValorTexto: isCancelada ? "Cancelado" : "Aguardando proposta",
                        ValorIsPreco: false,
                        StatusDica: statusDica,
                        DicaIcone: isCancelada ? "x" : "clock"
                    );
                });

            listaPedidos.InsertRange(0, pendentes);
        }

        return listaPedidos;
    }

    public async Task<PedidoDetalheResponse?> ObterDetalhesAsync(int pedidoId, int usuarioId)
    {
        var p = await _pedidoRepository.ObterPorIdAsync(pedidoId);
        if (p == null) return null;

        if (p.ClienteId != usuarioId && p.PrestadorId != usuarioId)
        {
            throw new UnauthorizedAccessException("Você não tem acesso aos dados deste pedido.");
        }

        var statusTexto = p.Status switch
        {
            StatusPedido.AGUARDANDO_ACEITE => "Aguardando Aceite",
            StatusPedido.AGENDADO => "Aceito",
            StatusPedido.EM_EXECUCAO => "Em Execução",
            StatusPedido.CONCLUIDO => "Concluído",
            StatusPedido.CANCELADO => "Cancelado",
            _ => p.Status.ToString()
        };

        PropostaResponse? propostaDto = null;
        if (p.Proposta != null)
        {
            propostaDto = new PropostaResponse(
                p.Proposta.Id,
                p.Proposta.SolicitacaoId,
                p.Proposta.PrestadorId,
                p.Proposta.ValorTotal,
                p.Proposta.PrazoDias,
                p.Proposta.Descricao,
                p.Proposta.Status.ToString(),
                p.Proposta.CriadoEm,
                p.Proposta.Itens.Select(i => new ItemPropostaResponse(i.Id, i.Descricao ?? "", i.Valor, i.Quantidade)).ToList()
            );
        }

        var prestadorNome = p.Prestador?.NomeFantasia ?? p.Prestador?.Usuario?.Nome ?? "Prestador";
        var prestadorAvatar = p.Prestador?.Usuario?.FotoPerfilUrl ?? p.Prestador?.CapaUrl ?? "";
        var prestadorProfissao = !string.IsNullOrWhiteSpace(p.Prestador?.NomeFantasia)
            ? p.Prestador.NomeFantasia
            : "Profissional Verificado";

        var clienteNome = p.Cliente?.Usuario?.Nome ?? "Cliente";
        var podeAvaliar = p.Status == StatusPedido.CONCLUIDO && p.Avaliacao == null && p.ClienteId == usuarioId;
        var jaAvaliado = p.Avaliacao != null;

        return new PedidoDetalheResponse(
            Id: p.Id,
            ClienteId: p.ClienteId,
            ClienteNome: clienteNome,
            PrestadorId: p.PrestadorId,
            PrestadorNome: prestadorNome,
            PrestadorProfissao: prestadorProfissao,
            PrestadorAvatar: prestadorAvatar,
            TituloServico: p.DescricaoNecessidade.Length > 50 ? p.DescricaoNecessidade[..50] + "..." : p.DescricaoNecessidade,
            DescricaoServico: p.DescricaoNecessidade,
            Status: p.Status.ToString(),
            StatusTexto: statusTexto,
            ValorCombinado: p.ValorCombinado,
            ValorFinal: p.ValorFinal,
            DataCriacao: p.DataSolicitacao,
            AgendadoPara: p.AgendadoPara,
            ConcluidoEm: p.ConcluidoEm,
            EnderecoAtendimento: p.EnderecoAtendimento,
            Proposta: propostaDto,
            PodeAvaliar: podeAvaliar,
            JaAvaliado: jaAvaliado
        );
    }

    public async Task<PedidoDetalheResponse> AceitarPropostaECriarPedidoAsync(int clienteId, int propostaId)
    {
        var proposta = await _solicitacaoRepository.ObterPropostaPorIdAsync(propostaId)
            ?? throw new KeyNotFoundException($"Proposta #{propostaId} não encontrada.");

        if (proposta.Solicitacao.ClienteId != clienteId)
        {
            throw new UnauthorizedAccessException("Apenas o cliente solicitante pode aceitar a proposta comercial.");
        }

        // Atualiza proposta e solicitacao
        await _solicitacaoRepository.AtualizarStatusPropostaAsync(propostaId, "ACEITA");
        await _solicitacaoRepository.AtualizarStatusAsync(proposta.SolicitacaoId, "ACEITA");

        // Cria o pedido com status AGUARDANDO_ACEITE (Requisito CON_017)
        var pedido = new Pedido
        {
            ClienteId = clienteId,
            PrestadorId = proposta.PrestadorId,
            PropostaId = proposta.Id,
            EnderecoAtendimento = proposta.Solicitacao.EnderecoAtendimento,
            DescricaoNecessidade = proposta.Solicitacao.Descricao,
            Status = StatusPedido.AGUARDANDO_ACEITE,
            ValorCombinado = proposta.ValorTotal,
            ValorFinal = proposta.ValorTotal,
            DataSolicitacao = DateTime.UtcNow
        };

        var criado = await _pedidoRepository.AdicionarAsync(pedido);
        var detalhe = await ObterDetalhesAsync(criado.Id, clienteId);
        return detalhe!;
    }

    public async Task ConfirmarPagamentoGarantiaAsync(int clienteId, int pedidoId, PagamentoPedidoRequest request)
    {
        var pedido = await _pedidoRepository.ObterPorIdAsync(pedidoId)
            ?? throw new KeyNotFoundException($"Pedido #{pedidoId} não encontrado.");

        if (pedido.ClienteId != clienteId)
        {
            throw new UnauthorizedAccessException("Apenas o cliente responsável pode confirmar o pagamento.");
        }

        // Evolui status para AGENDADO com valor retido em garantia
        await _pedidoRepository.AtualizarStatusAsync(pedidoId, "AGENDADO");
    }

    public async Task CancelarPedidoAsync(int usuarioId, int pedidoId)
    {
        var pedido = await _pedidoRepository.ObterPorIdAsync(pedidoId)
            ?? throw new KeyNotFoundException($"Pedido #{pedidoId} não encontrado.");

        if (pedido.ClienteId != usuarioId && pedido.PrestadorId != usuarioId)
        {
            throw new UnauthorizedAccessException("Você não tem permissão para cancelar este pedido.");
        }

        await _pedidoRepository.AtualizarStatusAsync(pedidoId, "CANCELADO");
    }

    public async Task ConcluirPedidoAsync(int prestadorId, int pedidoId)
    {
        var pedido = await _pedidoRepository.ObterPorIdAsync(pedidoId)
            ?? throw new KeyNotFoundException($"Pedido #{pedidoId} não encontrado.");

        if (pedido.PrestadorId != prestadorId)
        {
            throw new UnauthorizedAccessException("Apenas o prestador pode marcar o pedido como concluído.");
        }

        await _pedidoRepository.AtualizarStatusAsync(pedidoId, "CONCLUIDO");
    }

    private static string FormatarDataAmigavel(DateTime data)
    {
        var hoje = DateTime.UtcNow.Date;
        if (data.Date == hoje) return $"Hoje, {data:HH:mm}";
        if (data.Date == hoje.AddDays(-1)) return $"Ontem, {data:HH:mm}";
        return data.ToString("dd 'de' MMMM");
    }
}
