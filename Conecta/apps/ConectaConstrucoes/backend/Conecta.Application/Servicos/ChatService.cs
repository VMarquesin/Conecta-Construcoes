using Conecta.Application.DTOs;
using Conecta.Domain.Entidades;
using Conecta.Domain.Interfaces;

namespace Conecta.Application.Servicos;

public class ChatService : IChatService
{
    private readonly IChatRepository _chatRepository;

    public ChatService(IChatRepository chatRepository)
    {
        _chatRepository = chatRepository;
    }

    public async Task<IEnumerable<ConversaResumoResponse>> ListarConversasDoUsuarioAsync(int usuarioId)
    {
        var conversas = await _chatRepository.ListarConversasDoUsuarioAsync(usuarioId);
        return conversas.Select(c => MapearConversa(c, usuarioId));
    }

    public async Task<ConversaResumoResponse?> ObterConversaAsync(int conversaId, int usuarioId)
    {
        var c = await _chatRepository.ObterPorIdAsync(conversaId);
        if (c == null) return null;

        if (c.ClienteId != usuarioId && c.PrestadorId != usuarioId)
        {
            throw new UnauthorizedAccessException("Você não tem acesso a esta conversa.");
        }

        return MapearConversa(c, usuarioId);
    }

    public async Task<ConversaResumoResponse> IniciarConversaAsync(int clienteId, IniciarConversaRequest request)
    {
        var c = await _chatRepository.ObterOuCriarAsync(clienteId, request.PrestadorId, request.PedidoId);
        return MapearConversa(c!, clienteId);
    }

    public async Task<IEnumerable<MensagemItemResponse>> ListarMensagensAsync(int conversaId, int usuarioId)
    {
        var conversa = await _chatRepository.ObterPorIdAsync(conversaId)
            ?? throw new KeyNotFoundException($"Conversa #{conversaId} não encontrada.");

        if (conversa.ClienteId != usuarioId && conversa.PrestadorId != usuarioId)
        {
            throw new UnauthorizedAccessException("Você não tem permissão para visualizar mensagens desta conversa.");
        }

        var mensagens = await _chatRepository.ListarMensagensDaConversaAsync(conversaId);
        return mensagens.Select(m => MapearMensagem(m, conversa.ClienteId));
    }

    public async Task<MensagemItemResponse> EnviarMensagemAsync(int remetenteId, int conversaId, EnviarMensagemRequest request)
    {
        var conversa = await _chatRepository.ObterPorIdAsync(conversaId)
            ?? throw new KeyNotFoundException($"Conversa #{conversaId} não encontrada.");

        if (conversa.ClienteId != remetenteId && conversa.PrestadorId != remetenteId)
        {
            throw new UnauthorizedAccessException("Você não faz parte desta conversa.");
        }

        var tipo = !string.IsNullOrWhiteSpace(request.ImagemUrl) ? "IMAGEM" : "TEXTO";
        var mensagem = new Mensagem
        {
            ConversaId = conversaId,
            RemetenteId = remetenteId,
            Tipo = tipo,
            Conteudo = request.Texto?.Trim(),
            Lida = false,
            EnviadoEm = DateTime.UtcNow
        };

        if (!string.IsNullOrWhiteSpace(request.ImagemUrl))
        {
            mensagem.Anexos.Add(new MensagemAnexo
            {
                ArquivoUrl = request.ImagemUrl.Trim(),
                TipoArquivo = "image/jpeg"
            });
        }

        var criada = await _chatRepository.AdicionarMensagemAsync(mensagem);
        return MapearMensagem(criada, conversa.ClienteId, request.ImagemLegenda);
    }

    public async Task MarcarComoLidasAsync(int conversaId, int usuarioLeitorId)
    {
        await _chatRepository.MarcarComoLidasAsync(conversaId, usuarioLeitorId);
    }

    public async Task<int> ObterTotalNaoLidasAsync(int usuarioId)
    {
        return await _chatRepository.ContarNaoLidasAsync(usuarioId);
    }

    private static ConversaResumoResponse MapearConversa(Conversa c, int usuarioLogadoId)
    {
        var isClienteLogado = c.ClienteId == usuarioLogadoId;
        var outroNome = isClienteLogado
            ? (c.Prestador?.NomeFantasia ?? c.Prestador?.Usuario?.Nome ?? "Prestador")
            : (c.Cliente?.Usuario?.Nome ?? "Cliente");

        var outroAvatar = isClienteLogado
            ? (c.Prestador?.Usuario?.FotoPerfilUrl ?? c.Prestador?.CapaUrl ?? "")
            : (c.Cliente?.Usuario?.FotoPerfilUrl ?? "");

        var outroProfissao = isClienteLogado
            ? (c.Prestador?.NomeFantasia ?? "Prestador Verificado")
            : "Cliente Conecta";

        var ultimaMsg = c.Mensagens.FirstOrDefault();
        var ultimaTexto = ultimaMsg?.Conteudo ?? (ultimaMsg?.Tipo == "IMAGEM" ? "[Foto anexa]" : "Conversa iniciada");
        var tempoTexto = ultimaMsg != null ? FormatarTempoMinutos(ultimaMsg.EnviadoEm) : "Hoje";
        var naoLida = ultimaMsg != null && !ultimaMsg.Lida && ultimaMsg.RemetenteId != usuarioLogadoId;

        return new ConversaResumoResponse(
            Id: c.Id.ToString(),
            ConversaId: c.Id,
            PrestadorId: c.PrestadorId,
            Nome: outroNome,
            Profissao: outroProfissao,
            Avatar: outroAvatar,
            Online: true,
            StatusTexto: "Online agora • Responde rápido",
            NaoLida: naoLida,
            UltimaMensagem: ultimaTexto,
            Tempo: tempoTexto,
            PedidoNumero: c.PedidoId?.ToString(),
            Mensagens: new List<MensagemItemResponse>()
        );
    }

    private static MensagemItemResponse MapearMensagem(Mensagem m, int clienteId, string? legenda = null)
    {
        var remetenteTipo = m.RemetenteId == clienteId ? "usuario" : "prestador";
        var hora = m.EnviadoEm.ToLocalTime().ToString("HH:mm");
        var anexo = m.Anexos.FirstOrDefault();

        return new MensagemItemResponse(
            Id: m.Id.ToString(),
            Remetente: remetenteTipo,
            Texto: m.Conteudo,
            ImagemUrl: anexo?.ArquivoUrl,
            ImagemLegenda: legenda ?? (anexo != null ? "anexo_foto.jpg" : null),
            Hora: hora,
            Status: m.Lida ? "Lido" : "Entregue",
            IsProposta: false
        );
    }

    private static string FormatarTempoMinutos(DateTime data)
    {
        var span = DateTime.UtcNow - data;
        if (span.TotalMinutes < 60) return $"{(int)Math.Max(1, span.TotalMinutes)} min";
        if (span.TotalHours < 24) return $"{(int)span.TotalHours} h";
        return $"{(int)span.TotalDays} d";
    }
}
