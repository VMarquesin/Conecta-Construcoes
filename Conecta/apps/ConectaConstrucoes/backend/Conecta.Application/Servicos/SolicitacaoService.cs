using Conecta.Application.DTOs;
using Conecta.Domain.Entidades;
using Conecta.Domain.Enums;
using Conecta.Domain.Interfaces;

namespace Conecta.Application.Servicos;

public class SolicitacaoService : ISolicitacaoService
{
    private readonly ISolicitacaoRepository _solicitacaoRepository;
    private readonly IPrestadorRepository _prestadorRepository;

    public SolicitacaoService(
        ISolicitacaoRepository solicitacaoRepository,
        IPrestadorRepository prestadorRepository)
    {
        _solicitacaoRepository = solicitacaoRepository;
        _prestadorRepository = prestadorRepository;
    }

    public async Task<SolicitacaoResponse> CriarAsync(int clienteId, CriarSolicitacaoRequest request)
    {
        var prestador = await _prestadorRepository.ObterPorUsuarioIdAsync(request.PrestadorId)
            ?? throw new KeyNotFoundException($"Prestador com ID {request.PrestadorId} não encontrado.");

        var solicitacao = new Solicitacao
        {
            ClienteId = clienteId,
            PrestadorId = request.PrestadorId,
            CategoriaId = request.CategoriaId,
            Titulo = request.Titulo.Trim(),
            Descricao = request.Descricao.Trim(),
            Status = StatusSolicitacao.ABERTA, // Requisito CON_016
            EnderecoAtendimento = request.EnderecoAtendimento?.Trim()
        };

        if (request.Imagens != null && request.Imagens.Any())
        {
            foreach (var imgUrl in request.Imagens)
            {
                if (!string.IsNullOrWhiteSpace(imgUrl))
                {
                    solicitacao.Imagens.Add(new SolicitacaoImagem
                    {
                        ImagemUrl = imgUrl.Trim(),
                        CriadoEm = DateTime.UtcNow
                    });
                }
            }
        }

        var criada = await _solicitacaoRepository.AdicionarAsync(solicitacao);
        var recarregada = await _solicitacaoRepository.ObterPorIdAsync(criada.Id);

        return MapearParaResponse(recarregada ?? criada);
    }

    public async Task<SolicitacaoResponse?> ObterPorIdAsync(int solicitacaoId)
    {
        var s = await _solicitacaoRepository.ObterPorIdAsync(solicitacaoId);
        return s == null ? null : MapearParaResponse(s);
    }

    public async Task<IEnumerable<SolicitacaoResponse>> ListarPorClienteAsync(int clienteId)
    {
        var lista = await _solicitacaoRepository.ListarPorClienteAsync(clienteId);
        return lista.Select(MapearParaResponse);
    }

    public async Task<PropostaResponse> EnviarPropostaAsync(int prestadorId, int solicitacaoId, EnviarPropostaRequest request)
    {
        var solicitacao = await _solicitacaoRepository.ObterPorIdAsync(solicitacaoId)
            ?? throw new KeyNotFoundException($"Solicitação #{solicitacaoId} não encontrada.");

        if (solicitacao.PrestadorId != prestadorId)
        {
            throw new UnauthorizedAccessException("Você não tem permissão para responder a esta solicitação.");
        }

        var proposta = new Proposta
        {
            SolicitacaoId = solicitacaoId,
            PrestadorId = prestadorId,
            ValorTotal = request.ValorTotal,
            PrazoDias = request.PrazoDias,
            Descricao = request.Descricao?.Trim(),
            Status = StatusProposta.ENVIADA
        };

        if (request.Itens != null && request.Itens.Any())
        {
            foreach (var item in request.Itens)
            {
                proposta.Itens.Add(new PropostaItem
                {
                    Descricao = item.Descricao.Trim(),
                    Valor = item.Valor,
                    Quantidade = item.Quantidade
                });
            }
        }

        var criada = await _solicitacaoRepository.AdicionarPropostaAsync(proposta);

        // Atualiza status da solicitação
        await _solicitacaoRepository.AtualizarStatusAsync(solicitacaoId, "PROPOSTA_RECEBIDA");

        return new PropostaResponse(
            criada.Id,
            criada.SolicitacaoId,
            criada.PrestadorId,
            criada.ValorTotal,
            criada.PrazoDias,
            criada.Descricao,
            criada.Status.ToString(),
            criada.CriadoEm,
            criada.Itens.Select(i => new ItemPropostaResponse(i.Id, i.Descricao ?? "", i.Valor, i.Quantidade)).ToList()
        );
    }

    public async Task RecusarSolicitacaoAsync(int prestadorId, int solicitacaoId)
    {
        var solicitacao = await _solicitacaoRepository.ObterPorIdAsync(solicitacaoId)
            ?? throw new KeyNotFoundException($"Solicitação #{solicitacaoId} não encontrada.");

        if (solicitacao.PrestadorId != prestadorId)
        {
            throw new UnauthorizedAccessException("Você não tem permissão para recusar esta solicitação.");
        }

        await _solicitacaoRepository.AtualizarStatusAsync(solicitacaoId, "RECUSADA");
    }

    public async Task CancelarSolicitacaoAsync(int clienteId, int solicitacaoId)
    {
        var solicitacao = await _solicitacaoRepository.ObterPorIdAsync(solicitacaoId)
            ?? throw new KeyNotFoundException($"Solicitação #{solicitacaoId} não encontrada.");

        if (solicitacao.ClienteId != clienteId)
        {
            throw new UnauthorizedAccessException("Apenas o cliente solicitante pode cancelar a solicitação.");
        }

        await _solicitacaoRepository.AtualizarStatusAsync(solicitacaoId, "CANCELADA");
    }

    private static SolicitacaoResponse MapearParaResponse(Solicitacao s)
    {
        return new SolicitacaoResponse(
            s.Id,
            s.ClienteId,
            s.Cliente?.Usuario?.Nome ?? "Cliente",
            s.PrestadorId,
            s.Prestador?.NomeFantasia ?? s.Prestador?.Usuario?.Nome ?? "Prestador",
            s.Titulo,
            s.Descricao,
            s.Status.ToString(),
            s.EnderecoAtendimento,
            s.CriadoEm,
            s.Imagens.Select(i => i.ImagemUrl).ToList()
        );
    }
}
