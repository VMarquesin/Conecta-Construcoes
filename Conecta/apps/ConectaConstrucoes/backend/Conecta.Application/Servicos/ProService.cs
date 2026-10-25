using Conecta.Application.DTOs;
using Conecta.Domain.Entidades;
using Conecta.Domain.Interfaces;

namespace Conecta.Application.Servicos;

public class ProService : IProService
{
    private readonly IPrestadorRepository _prestadorRepository;
    private readonly ISolicitacaoRepository _solicitacaoRepository;
    private readonly IPedidoRepository _pedidoRepository;

    public ProService(
        IPrestadorRepository prestadorRepository,
        ISolicitacaoRepository solicitacaoRepository,
        IPedidoRepository pedidoRepository)
    {
        _prestadorRepository = prestadorRepository;
        _solicitacaoRepository = solicitacaoRepository;
        _pedidoRepository = pedidoRepository;
    }

    public async Task<ProDashboardResponse> ObterDashboardAsync(int prestadorId)
    {
        var prestador = await _prestadorRepository.ObterPorUsuarioIdAsync(prestadorId)
            ?? throw new KeyNotFoundException($"Perfil de prestador não encontrado para o usuário #{prestadorId}.");

        var solicitacoesPendentes = await _solicitacaoRepository.ListarPendentesPorPrestadorAsync(prestadorId);
        var endereco = await _prestadorRepository.ObterEnderecoPrincipalAsync(prestadorId);

        // Calcula ganhos dos pedidos concluídos nos últimos 7 dias
        var dataLimite = DateTime.UtcNow.AddDays(-7);
        var ganhosSemana = await _prestadorRepository.ObterGanhosConcluidosAsync(prestadorId, dataLimite);

        if (ganhosSemana == 0) ganhosSemana = 840.00m; // Fallback demonstrativo

        var pendentesDtos = solicitacoesPendentes.Select(s =>
        {
            var tempoMinutos = (int)Math.Max(1, (DateTime.UtcNow - s.CriadoEm).TotalMinutes);
            var tempoTexto = tempoMinutos < 60 ? $"{tempoMinutos} min" : $"{tempoMinutos / 60} h";

            return new ProSolicitacaoPendenteDto(
                Id: s.Id.ToString(),
                ClienteNome: s.Cliente?.Usuario?.Nome ?? "Cliente",
                ClienteAvatar: s.Cliente?.Usuario?.FotoPerfilUrl ?? "",
                TempoRelativo: tempoTexto,
                LocalTexto: s.EnderecoAtendimento ?? "Região Central",
                Tags: new List<string> { s.Titulo.Length > 20 ? s.Titulo[..20] : s.Titulo },
                IsUrgente: s.Descricao.Contains("urgente", StringComparison.OrdinalIgnoreCase) || s.Titulo.Contains("urgente", StringComparison.OrdinalIgnoreCase),
                Descricao: s.Descricao
            );
        }).ToList();

        var metricas = new ProMetricasSemanaDto(
            PedidosAguardando: pendentesDtos.Count,
            AvaliacaoMedia: prestador.Usuario.MediaAvaliacao > 0 ? prestador.Usuario.MediaAvaliacao : 4.9m,
            TotalAvaliacoes: prestador.Usuario.TotalAvaliacoes > 0 ? prestador.Usuario.TotalAvaliacoes : 128,
            GanhosSemana: ganhosSemana
        );

        var disponivel = prestador.StatusDisponibilidade == "DISPONIVEL";
        var profissao = !string.IsNullOrWhiteSpace(prestador.NomeFantasia)
            ? prestador.NomeFantasia
            : "Eletricista Residencial e Predial em Tupã";

        return new ProDashboardResponse(
            Nome: prestador.Usuario.Nome,
            Profissao: profissao,
            Avatar: prestador.Usuario.FotoPerfilUrl ?? prestador.CapaUrl ?? "",
            Disponivel: disponivel,
            RaioAtendimentoKm: prestador.RaioAtendimentoKm,
            Cidade: endereco?.CidadeNome ?? "Tupã",
            MetricasSemana: metricas,
            PedidosPendentes: pendentesDtos
        );
    }

    public async Task AtualizarDisponibilidadeAsync(int prestadorId, string status)
    {
        var statusNormalizado = status.Trim().ToUpper();
        if (statusNormalizado != "DISPONIVEL" && statusNormalizado != "OCUPADO" && statusNormalizado != "AUSENTE" && statusNormalizado != "INATIVO")
        {
            throw new ArgumentException("Status de disponibilidade inválido.");
        }

        await _prestadorRepository.AtualizarStatusDisponibilidadeAsync(prestadorId, statusNormalizado);
    }

    public async Task AtualizarBioAsync(int prestadorId, string bio)
    {
        await _prestadorRepository.AtualizarBioAsync(prestadorId, bio.Trim());
    }

    public async Task<IEnumerable<FotoPortfolioDto>> ObterPortfolioAsync(int prestadorId)
    {
        var portfolios = await _prestadorRepository.ObterPortfoliosDoPrestadorAsync(prestadorId);

        return portfolios.Select(p =>
        {
            var img = p.Imagens.FirstOrDefault();
            return new FotoPortfolioDto(
                Id: p.Id.ToString(),
                Categoria: "iluminacao",
                TagCategoria: p.Titulo ?? "Trabalho",
                Titulo: p.Titulo ?? "Projeto Concluído",
                Detalhe: p.Descricao ?? "Realizado com garantia",
                ImagemUrl: img?.ImagemUrl ?? ""
            );
        });
    }

    public async Task<FotoPortfolioDto> AdicionarItemPortfolioAsync(int prestadorId, CriarItemPortfolioRequest request)
    {
        var portfolio = new Portfolio
        {
            PrestadorId = prestadorId,
            Titulo = request.Titulo.Trim(),
            Descricao = request.Detalhe?.Trim(),
            Destaque = true,
            CriadoEm = DateTime.UtcNow,
            AtualizadoEm = DateTime.UtcNow
        };

        if (!string.IsNullOrWhiteSpace(request.ImagemUrl))
        {
            portfolio.Imagens.Add(new PortfolioImagem
            {
                ImagemUrl = request.ImagemUrl.Trim(),
                Ordem = 1,
                CriadoEm = DateTime.UtcNow
            });
        }

        var criado = await _prestadorRepository.AdicionarPortfolioAsync(portfolio);

        return new FotoPortfolioDto(
            Id: criado.Id.ToString(),
            Categoria: request.Categoria ?? "iluminacao",
            TagCategoria: request.TagCategoria ?? "Novo Trabalho",
            Titulo: criado.Titulo ?? request.Titulo,
            Detalhe: criado.Descricao ?? "Recente",
            ImagemUrl: request.ImagemUrl
        );
    }

    public async Task RemoverItemPortfolioAsync(int prestadorId, int portfolioId)
    {
        await _prestadorRepository.RemoverPortfolioAsync(prestadorId, portfolioId);
    }
}
