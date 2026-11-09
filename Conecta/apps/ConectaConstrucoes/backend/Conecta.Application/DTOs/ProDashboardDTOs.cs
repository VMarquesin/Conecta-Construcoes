using System.ComponentModel.DataAnnotations;

namespace Conecta.Application.DTOs;

public record ProEstatisticasResponse(
    int UsuarioId,
    string Nome,
    int TotalPedidos,
    int TotalAvaliacoes,
    decimal MediaAvaliacoes,
    int TotalServicosRealizados
);

public record ProMetricasSemanaDto(
    int PedidosAguardando,
    decimal AvaliacaoMedia,
    int TotalAvaliacoes,
    decimal GanhosSemana
);

public record ProSolicitacaoPendenteDto(
    string Id,
    string ClienteNome,
    string ClienteAvatar,
    string TempoRelativo,
    string LocalTexto,
    List<string> Tags,
    bool IsUrgente,
    string Descricao
);

public record ProDashboardResponse(
    string Nome,
    string Profissao,
    string Avatar,
    bool Disponivel,
    int RaioAtendimentoKm,
    string Cidade,
    ProMetricasSemanaDto MetricasSemana,
    List<ProSolicitacaoPendenteDto> PedidosPendentes
);

public record AtualizarDisponibilidadeRequest(
    [Required] string Status // "DISPONIVEL", "OCUPADO"
);

public record AtualizarBioRequest(
    [Required] string Bio
);

public record FotoPortfolioDto(
    string Id,
    string Categoria,
    string TagCategoria,
    string Titulo,
    string Detalhe,
    string ImagemUrl
);

public record CriarItemPortfolioRequest(
    [Required] string Titulo,
    string? Categoria = "iluminacao",
    string? TagCategoria = "Novo Trabalho",
    string? Detalhe = "Recente",
    [Required] string ImagemUrl = ""
);
