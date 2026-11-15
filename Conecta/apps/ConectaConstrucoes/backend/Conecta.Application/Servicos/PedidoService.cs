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
                StatusPedido.AGUARDANDO_ACEITE => "AGUARDANDO_ACEITE",
                StatusPedido.AGENDADO => "AGENDADO",
                StatusPedido.EM_EXECUCAO => "ACEITA",
                StatusPedido.CONCLUIDO => "CONCLUIDA",
                StatusPedido.CANCELADO => "CANCELADO",
                _ => p.Status.ToString()
            };

            var statusTexto = p.Status switch
            {
                StatusPedido.AGUARDANDO_ACEITE => "Aguardando Aceite",
                StatusPedido.AGENDADO => "Agendado",
                StatusPedido.EM_EXECUCAO => "Em Andamento",
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
                StatusPedido.AGUARDANDO_ACEITE => "Proposta enviada - Aguardando cliente",
                StatusPedido.AGENDADO => p.AgendadoPara.HasValue ? $"Agendado para {p.AgendadoPara.Value:dd/MM, HH:mm}" : "Agendamento confirmado",
                StatusPedido.EM_EXECUCAO => "Serviço em execução",
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
            var clienteNome = p.Cliente?.Usuario?.Nome ?? "Cliente";

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
                JaAvaliado: jaAvaliado,
                ClienteId: p.ClienteId,
                ClienteNome: clienteNome
            );
        }).ToList();

        // Inclui também as solicitações abertas, aguardando proposta ou com propostas em andamento
        var solicitacoesCliente = await _solicitacaoRepository.ListarPorClienteAsync(usuarioId);
        var solicitacoesPrestador = await _solicitacaoRepository.ListarPorPrestadorAsync(usuarioId);
        var solicitacoes = solicitacoesCliente.Concat(solicitacoesPrestador).DistinctBy(s => s.Id);
        var solicitacoesMapeadas = solicitacoes
            .Where(s => !listaPedidos.Any(p => p.Id == s.Id || p.TituloServico == s.Titulo || p.DescricaoServico == s.Descricao))
            .Select(s =>
            {
                var prestadorNome = s.Prestador?.NomeFantasia ?? s.Prestador?.Usuario?.Nome ?? "Prestador";
                var prestadorAvatar = s.Prestador?.Usuario?.FotoPerfilUrl ?? s.Prestador?.CapaUrl ?? "";
                var prestadorProfissao = !string.IsNullOrWhiteSpace(s.Prestador?.NomeFantasia)
                    ? s.Prestador.NomeFantasia
                    : (s.Categoria?.Nome ?? "Profissional Verificado");
                var clienteNome = s.Cliente?.Usuario?.Nome ?? "Cliente";

                var ultimaProposta = s.Propostas?.OrderByDescending(prop => prop.CriadoEm).FirstOrDefault();

                var isCancelada = s.Status == StatusSolicitacao.CANCELADA || s.Status == StatusSolicitacao.RECUSADA;
                var isPropostaRecebida = s.Status == StatusSolicitacao.PROPOSTA_RECEBIDA;
                var isAceita = s.Status == StatusSolicitacao.ACEITA;
                var isConcluida = s.Status == StatusSolicitacao.CONCLUIDA;

                string statusStr;
                string statusTexto;
                string statusDica;
                string valorLabel;
                string valorTexto;
                bool valorIsPreco = false;
                string dicaIcone;

                if (isCancelada)
                {
                    statusStr = "CANCELADO";
                    statusTexto = "Cancelado";
                    statusDica = "Solicitação cancelada";
                    valorLabel = "Orçamento";
                    valorTexto = "Cancelado";
                    dicaIcone = "x";
                }
                else if (isConcluida)
                {
                    statusStr = "CONCLUIDA";
                    statusTexto = "Concluído";
                    statusDica = "Serviço finalizado com garantia Conecta";
                    valorLabel = "Valor Pago";
                    valorTexto = ultimaProposta != null ? $"R$ {ultimaProposta.ValorTotal:F2}" : "Concluído";
                    valorIsPreco = ultimaProposta != null;
                    dicaIcone = "check";
                }
                else if (isPropostaRecebida)
                {
                    statusStr = "AGUARDANDO_ACEITE";
                    statusTexto = "Aguardando Aceite";
                    statusDica = "Aguardando proposta";
                    valorLabel = "Proposta Enviada";
                    valorTexto = ultimaProposta != null ? $"R$ {ultimaProposta.ValorTotal:F2}" : "Aguardando cliente";
                    valorIsPreco = ultimaProposta != null;
                    dicaIcone = "clock";
                }
                else if (isAceita)
                {
                    statusStr = "ACEITA";
                    statusTexto = "Aceito";
                    statusDica = "Proposta aceita pelo cliente";
                    valorLabel = "Valor Fechado";
                    valorTexto = ultimaProposta != null ? $"R$ {ultimaProposta.ValorTotal:F2}" : "A combinar";
                    valorIsPreco = ultimaProposta != null;
                    dicaIcone = "check";
                }
                else
                {
                    statusStr = "ABERTA";
                    statusTexto = "Aguardando Proposta";
                    statusDica = "Aguardando proposta";
                    valorLabel = "Orçamento Estimado";
                    valorTexto = "A combinar";
                    valorIsPreco = false;
                    dicaIcone = "clock";
                }

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
                    ValorLabel: valorLabel,
                    ValorTexto: valorTexto,
                    ValorIsPreco: valorIsPreco,
                    StatusDica: statusDica,
                    DicaIcone: dicaIcone,
                    PodeAvaliar: false,
                    JaAvaliado: false,
                    ClienteId: s.ClienteId,
                    ClienteNome: clienteNome
                );
            });

        listaPedidos.InsertRange(0, solicitacoesMapeadas);

        return listaPedidos;
    }

    public async Task<PedidoDetalheResponse?> ObterDetalhesAsync(int pedidoId, int usuarioId)
    {
        var p = await _pedidoRepository.ObterPorIdAsync(pedidoId);
        if (p == null)
        {
            var s = await _solicitacaoRepository.ObterPorIdAsync(pedidoId);
            if (s == null) return null;

            if (s.ClienteId != usuarioId && s.PrestadorId != usuarioId)
            {
                throw new UnauthorizedAccessException("Você não tem acesso aos dados deste pedido.");
            }

            var ultimaProp = s.Propostas?.OrderByDescending(prop => prop.CriadoEm).FirstOrDefault();
            PropostaResponse? propDto = null;
            if (ultimaProp != null)
            {
                propDto = new PropostaResponse(
                    ultimaProp.Id,
                    ultimaProp.SolicitacaoId,
                    ultimaProp.PrestadorId,
                    ultimaProp.ValorTotal,
                    ultimaProp.PrazoDias,
                    ultimaProp.Descricao,
                    ultimaProp.Status.ToString(),
                    ultimaProp.CriadoEm,
                    ultimaProp.Itens.Select(i => new ItemPropostaResponse(i.Id, i.Descricao ?? "", i.Valor, i.Quantidade)).ToList()
                );
            }

            var sStatusStr = s.Status == StatusSolicitacao.PROPOSTA_RECEBIDA ? "AGUARDANDO_ACEITE"
                : s.Status == StatusSolicitacao.ACEITA ? "ACEITA"
                : s.Status == StatusSolicitacao.CANCELADA ? "CANCELADO"
                : s.Status.ToString();

            var sStatusTxt = s.Status == StatusSolicitacao.PROPOSTA_RECEBIDA ? "Aguardando Aceite"
                : s.Status == StatusSolicitacao.ACEITA ? "Aceito"
                : s.Status == StatusSolicitacao.CANCELADA ? "Cancelado"
                : "Aguardando Proposta";

            var prestadorNomeS = s.Prestador?.NomeFantasia ?? s.Prestador?.Usuario?.Nome ?? "Prestador";
            var prestadorAvatarS = s.Prestador?.Usuario?.FotoPerfilUrl ?? s.Prestador?.CapaUrl ?? "";
            var prestadorProfissaoS = !string.IsNullOrWhiteSpace(s.Prestador?.NomeFantasia)
                ? s.Prestador.NomeFantasia
                : (s.Categoria?.Nome ?? "Profissional Verificado");
            var clienteNomeS = s.Cliente?.Usuario?.Nome ?? "Cliente";

            var valorProp = ultimaProp?.ValorTotal;

            return new PedidoDetalheResponse(
                Id: s.Id,
                ClienteId: s.ClienteId,
                ClienteNome: clienteNomeS,
                PrestadorId: s.PrestadorId,
                PrestadorNome: prestadorNomeS,
                PrestadorProfissao: prestadorProfissaoS,
                PrestadorAvatar: prestadorAvatarS,
                TituloServico: s.Titulo,
                DescricaoServico: s.Descricao,
                Status: sStatusStr,
                StatusTexto: sStatusTxt,
                ValorCombinado: valorProp,
                ValorFinal: valorProp,
                DataCriacao: s.CriadoEm,
                AgendadoPara: null,
                ConcluidoEm: null,
                EnderecoAtendimento: s.EnderecoAtendimento,
                Proposta: propDto,
                PodeAvaliar: false,
                JaAvaliado: false
            );
        }

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

    public async Task<PedidoDetalheResponse> AceitarPropostaECriarPedidoAsync(int usuarioId, int propostaId)
    {
        var proposta = await _solicitacaoRepository.ObterPropostaPorIdAsync(propostaId)
            ?? throw new KeyNotFoundException($"Proposta #{propostaId} não encontrada.");

        if (proposta.Solicitacao.ClienteId != usuarioId && proposta.PrestadorId != usuarioId)
        {
            throw new UnauthorizedAccessException("Apenas o cliente solicitante ou o prestador responsável podem aceitar/confirmar a proposta comercial.");
        }

        // Atualiza proposta e solicitacao
        await _solicitacaoRepository.AtualizarStatusPropostaAsync(propostaId, "ACEITA");
        await _solicitacaoRepository.AtualizarStatusAsync(proposta.SolicitacaoId, "ACEITA");

        // Cria o pedido com status AGUARDANDO_ACEITE (Requisito CON_017)
        var pedido = new Pedido
        {
            ClienteId = proposta.Solicitacao.ClienteId,
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
        var detalhe = await ObterDetalhesAsync(criado.Id, usuarioId);
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
        var pedido = await _pedidoRepository.ObterPorIdAsync(pedidoId);
        if (pedido != null)
        {
            if (pedido.PrestadorId != prestadorId)
            {
                throw new UnauthorizedAccessException("Apenas o prestador pode marcar o pedido como concluído.");
            }

            await _pedidoRepository.AtualizarStatusAsync(pedidoId, "CONCLUIDO");
            if (pedido.Proposta != null)
            {
                await _solicitacaoRepository.AtualizarStatusAsync(pedido.Proposta.SolicitacaoId, "CONCLUIDA");
            }
            return;
        }

        // Se não encontrou em Pedidos, unifica com a busca na tabela Solicitacoes
        var solicitacao = await _solicitacaoRepository.ObterPorIdAsync(pedidoId)
            ?? throw new KeyNotFoundException($"Pedido ou solicitação #{pedidoId} não encontrado.");

        if (solicitacao.PrestadorId != prestadorId)
        {
            throw new UnauthorizedAccessException("Apenas o prestador pode marcar a solicitação como concluída.");
        }

        await _solicitacaoRepository.AtualizarStatusAsync(pedidoId, "CONCLUIDA");

        var prop = solicitacao.Propostas?.OrderByDescending(p => p.CriadoEm).FirstOrDefault();
        var novoPedido = new Pedido
        {
            ClienteId = solicitacao.ClienteId,
            PrestadorId = solicitacao.PrestadorId,
            PropostaId = prop?.Id,
            EnderecoAtendimento = solicitacao.EnderecoAtendimento,
            DescricaoNecessidade = solicitacao.Descricao,
            Status = StatusPedido.CONCLUIDO,
            ValorCombinado = prop?.ValorTotal,
            ValorFinal = prop?.ValorTotal,
            DataSolicitacao = solicitacao.CriadoEm,
            AgendadoPara = DateTime.UtcNow,
            ConcluidoEm = DateTime.UtcNow,
            DataConclusao = DateTime.UtcNow,
            CriadoEm = solicitacao.CriadoEm,
            AtualizadoEm = DateTime.UtcNow
        };
        await _pedidoRepository.AdicionarAsync(novoPedido);
    }

    private static string FormatarDataAmigavel(DateTime data)
    {
        var hoje = DateTime.UtcNow.Date;
        if (data.Date == hoje) return $"Hoje, {data:HH:mm}";
        if (data.Date == hoje.AddDays(-1)) return $"Ontem, {data:HH:mm}";
        return data.ToString("dd 'de' MMMM");
    }
}
