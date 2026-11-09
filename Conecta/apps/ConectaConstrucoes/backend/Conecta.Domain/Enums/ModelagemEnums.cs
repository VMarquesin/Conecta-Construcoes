using NpgsqlTypes;

namespace Conecta.Domain.Enums;

public enum StatusDisponibilidade
{
    [PgName("DISPONIVEL")]
    DISPONIVEL,
    [PgName("OCUPADO")]
    OCUPADO,
    [PgName("AUSENTE")]
    AUSENTE,
    [PgName("INATIVO")]
    INATIVO
}

public enum StatusSolicitacao
{
    [PgName("ABERTA")]
    ABERTA,
    [PgName("AGUARDANDO_PROPOSTA")]
    AGUARDANDO_PROPOSTA,
    [PgName("PROPOSTA_RECEBIDA")]
    PROPOSTA_RECEBIDA,
    [PgName("ACEITA")]
    ACEITA,
    [PgName("RECUSADA")]
    RECUSADA,
    [PgName("CANCELADA")]
    CANCELADA
}

public enum StatusProposta
{
    [PgName("ENVIADA")]
    ENVIADA,
    [PgName("VISUALIZADA")]
    VISUALIZADA,
    [PgName("ACEITA")]
    ACEITA,
    [PgName("RECUSADA")]
    RECUSADA,
    [PgName("EXPIRADA")]
    EXPIRADA
}

public enum StatusPedido
{
    [PgName("AGUARDANDO_ACEITE")]
    AGUARDANDO_ACEITE,
    [PgName("AGENDADO")]
    AGENDADO,
    [PgName("EM_EXECUCAO")]
    EM_EXECUCAO,
    [PgName("CONCLUIDO")]
    CONCLUIDO,
    [PgName("CANCELADO")]
    CANCELADO
}

public enum TipoMensagem
{
    [PgName("TEXTO")]
    TEXTO,
    [PgName("IMAGEM")]
    IMAGEM,
    [PgName("AUDIO")]
    AUDIO,
    [PgName("VIDEO")]
    VIDEO,
    [PgName("ARQUIVO")]
    ARQUIVO
}

public enum StatusVerificacao
{
    [PgName("PENDENTE_DOCS")]
    PENDENTE_DOCS,
    [PgName("DOCUMENTOS_RECEBIDOS")]
    DOCUMENTOS_RECEBIDOS,
    [PgName("DOCUMENTOS_VERIFICADOS")]
    DOCUMENTOS_VERIFICADOS,
    [PgName("VERIFICADO")]
    VERIFICADO,
    [PgName("REJEITADO")]
    REJEITADO,
    [PgName("COMPLETO")]
    COMPLETO
}

public enum StatusConta
{
    [PgName("ATIVA")]
    ATIVA,
    [PgName("BLOQUEADA")]
    BLOQUEADA,
    [PgName("SUSPENSA")]
    SUSPENSA,
    [PgName("DELETADA")]
    DELETADA
}

public enum StatusDocumento
{
    [PgName("PENDENTE")]
    PENDENTE,
    [PgName("APROVADO")]
    APROVADO,
    [PgName("REJEITADO")]
    REJEITADO
}

public enum TipoDenuncia
{
    [PgName("COMPORTAMENTO_INAPROPRIADO")]
    COMPORTAMENTO_INAPROPRIADO,
    [PgName("FRAUDE")]
    FRAUDE,
    [PgName("CONTEUDO_ILEGAL")]
    CONTEUDO_ILEGAL,
    [PgName("PERFIL_FALSO")]
    PERFIL_FALSO,
    [PgName("NAO_COMPLETOU_SERVICO")]
    NAO_COMPLETOU_SERVICO,
    [PgName("COBRANCA_INDEVIDA")]
    COBRANCA_INDEVIDA,
    [PgName("OUTRO")]
    OUTRO
}

public enum StatusDenuncia
{
    [PgName("ABERTA")]
    ABERTA,
    [PgName("ANALISANDO")]
    ANALISANDO,
    [PgName("ENCERRADA")]
    ENCERRADA,
    [PgName("RESOLVIDA")]
    RESOLVIDA,
    [PgName("BANIDO")]
    BANIDO
}
