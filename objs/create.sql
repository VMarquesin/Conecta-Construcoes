-- ============================================================================
-- Conecta - SCHEMA COMPLETO PARA PostgreSQL
-- ============================================================================

-- ============================================================================
-- 1. TIPOS PERSONALIZADOS (ENUMS)
-- ============================================================================

CREATE TYPE status_disponibilidade AS ENUM (
    'DISPONIVEL',
    'OCUPADO',
    'AUSENTE',
    'INATIVO'
);

CREATE TYPE status_solicitacao AS ENUM (
    'ABERTA',
    'AGUARDANDO_PROPOSTA',
    'PROPOSTA_RECEBIDA',
    'ACEITA',
    'RECUSADA',
    'CANCELADA'
);

CREATE TYPE status_proposta AS ENUM (
    'ENVIADA',
    'VISUALIZADA',
    'ACEITA',
    'RECUSADA',
    'EXPIRADA'
);

CREATE TYPE status_pedido AS ENUM (
    'AGUARDANDO_ACEITE',
    'AGENDADO',
    'EM_EXECUCAO',
    'CONCLUIDO',
    'CANCELADO'
);

CREATE TYPE tipo_mensagem AS ENUM (
    'TEXTO',
    'IMAGEM',
    'AUDIO',
    'VIDEO',
    'ARQUIVO'
);

CREATE TYPE status_verificacao AS ENUM (
    'PENDENTE_DOCS',           -- Prestador: aguardando envio de docs
    'DOCUMENTOS_RECEBIDOS',    -- Prestador: docs recebidos, aguardando análise
    'DOCUMENTOS_VERIFICADOS',  -- Prestador: docs verificados e aprovados
    'VERIFICADO',              -- Prestador: completo e verificado
    'REJEITADO',               -- Prestador: documentos rejeitados
    'COMPLETO'                 -- Cliente: cadastro completo
);

CREATE TYPE status_conta AS ENUM (
    'ATIVA',
    'BLOQUEADA',
    'SUSPENSA',
    'DELETADA'
);

CREATE TYPE status_documento AS ENUM (
    'PENDENTE',
    'APROVADO',
    'REJEITADO'
);

CREATE TYPE tipo_denuncia AS ENUM (
    'COMPORTAMENTO_INAPROPRIADO',
    'FRAUDE',
    'CONTEUDO_ILEGAL',
    'PERFIL_FALSO',
    'NAO_COMPLETOU_SERVICO',
    'COBRANCA_INDEVIDA',
    'OUTRO'
);

CREATE TYPE status_denuncia AS ENUM (
    'ABERTA',
    'ANALISANDO',
    'ENCERRADA',
    'RESOLVIDA',
    'BANIDO'
);

-- ============================================================================
-- 2. TABELAS PRINCIPAIS
-- ============================================================================

-- Roles (Papéis)
CREATE TABLE roles (
    id        SERIAL      PRIMARY KEY,
    nome      VARCHAR(50) UNIQUE NOT NULL,
    descricao TEXT,
    ativo     BOOLEAN     DEFAULT TRUE,
    criado_em TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

-- Permissões
CREATE TABLE permissoes (
    id        SERIAL       PRIMARY KEY,
    nome      VARCHAR(100) UNIQUE NOT NULL,
    descricao TEXT,
    recurso   VARCHAR(50),  -- usuarios, prestadores, categorias, financeiro, etc
    acao      VARCHAR(50),  -- criar, editar, deletar, aprovar, etc
    criado_em TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Relacionamento: Role → Permissões (N:N)
CREATE TABLE role_permissoes (
    role_id      INT NOT NULL,
    permissao_id INT NOT NULL,
    PRIMARY KEY (role_id, permissao_id),
    CONSTRAINT fk_role_permissoes_role      FOREIGN KEY(role_id)      REFERENCES roles(id)      ON DELETE CASCADE,
    CONSTRAINT fk_role_permissoes_permissao FOREIGN KEY(permissao_id) REFERENCES permissoes(id) ON DELETE CASCADE
);

-- Tabela: USUARIOS
CREATE TABLE usuarios (
    id                  SERIAL       PRIMARY KEY,
    email               VARCHAR(255) UNIQUE NOT NULL,
    senha_hash          VARCHAR(255) NOT NULL,
    nome                VARCHAR(150) NOT NULL,
    foto_perfil_url     VARCHAR(500),
    documento           VARCHAR(14),                 -- CPF ou CNPJ (documento do prestador)
    
    -- Status e Verificação
    status_verificacao  status_verificacao DEFAULT 'COMPLETO',
    status_conta        status_conta       DEFAULT 'ATIVA',
    
    -- Avaliações
    media_avaliacao     NUMERIC(3,2) DEFAULT 0,
    total_avaliacoes    INTEGER      DEFAULT 0,
    
    -- Timestamps
    ultimo_acesso_em    TIMESTAMP,
    termos_aceitos_em   TIMESTAMP,
    criado_em           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT ck_documento_format CHECK (documento ~ '^\d{3}\.\d{3}\.\d{3}-\d{2}$' OR documento ~ '^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$' OR documento IS NULL)
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_status_verificacao ON usuarios(status_verificacao);
CREATE INDEX idx_usuarios_status_conta ON usuarios(status_conta);

-- Um usuário pode possuir mais de um papel, por exemplo, CLIENTE e PRESTADOR.
CREATE TABLE usuario_roles (
    usuario_id    INT NOT NULL,
    role_id       INT NOT NULL,
    atribuido_em  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, role_id),
    CONSTRAINT fk_usuario_roles_usuario FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_usuario_roles_role    FOREIGN KEY(role_id)    REFERENCES roles(id)    ON DELETE CASCADE
);

CREATE INDEX idx_usuario_roles_role_id ON usuario_roles(role_id);

-- Tabela: TELEFONES
CREATE TABLE telefones (
    id         SERIAL      PRIMARY KEY,
    usuario_id INT         NOT NULL,
    numero     VARCHAR(20) NOT NULL,
    principal  BOOLEAN     DEFAULT TRUE,
    tipo       VARCHAR(20) DEFAULT 'WHATSAPP',
    criado_em  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_telefone_usuario FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX idx_telefones_usuario_id ON telefones(usuario_id);

-- Tabela: ENDEREÇOS SALVOS
CREATE TABLE enderecos (
    id            SERIAL       PRIMARY KEY,
    usuario_id    INT          NOT NULL,
    apelido       VARCHAR(50)  NOT NULL,       -- Casa, Trabalho, etc.
    cep           VARCHAR(8)   NOT NULL,
    logradouro    VARCHAR(200) NOT NULL,
    numero        VARCHAR(20)  NOT NULL,
    complemento   VARCHAR(100),
    bairro        VARCHAR(100) NOT NULL,
    cidade        VARCHAR(100) NOT NULL,
    estado        CHAR(2)      NOT NULL,
    latitude      NUMERIC(10,8),
    longitude     NUMERIC(11,8),
    principal     BOOLEAN      DEFAULT FALSE,
    criado_em     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_endereco_usuario FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT ck_endereco_cep     CHECK (cep ~ '^\d{5}-?\d{3}$'),
    CONSTRAINT ck_endereco_estado  CHECK (estado ~ '^[A-Z]{2}$')
);

CREATE INDEX idx_enderecos_usuario_id ON enderecos(usuario_id);
CREATE INDEX idx_enderecos_principal ON enderecos(usuario_id, principal);

-- Tabela: CLIENTE
-- Um usuário pode ser cliente
CREATE TABLE cliente (
    usuario_id    INT       PRIMARY KEY,
    ativo         BOOLEAN   DEFAULT TRUE,
    criado_em     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cliente_usuario FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela: PRESTADOR
-- Um usuário pode ser prestador
CREATE TABLE prestador (
    usuario_id                       INT PRIMARY KEY,
    nome_fantasia                    VARCHAR(150),
    bio                              TEXT,
    experiencia_anos                 INTEGER,
    valor_hora_inicial               NUMERIC(10,2),
    capa_url                         VARCHAR(500),
    
    -- Localização fixa (onde trabalha/atua)
    latitude                         NUMERIC(10,8) NOT NULL,
    longitude                        NUMERIC(11,8) NOT NULL,
    
    -- Configurações de atendimento
    raio_atendimento_km              INTEGER DEFAULT 15,
    status_disponibilidade           status_disponibilidade DEFAULT 'DISPONIVEL',
    
    -- Plano/Destaque
    plano_assinatura                 CHAR(1) DEFAULT 'G',  -- G=Grátis, P=Pago
    destaque_regiao                  BOOLEAN DEFAULT FALSE,
    selo_superprestador              BOOLEAN DEFAULT FALSE,
    tempo_medio_resposta_minutos     INTEGER,
    
    criado_em                         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em                     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prestador_usuario   FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT ck_raio_atendimento    CHECK (raio_atendimento_km > 0 AND raio_atendimento_km <= 100),
    CONSTRAINT ck_valor_hora_inicial  CHECK (valor_hora_inicial > 0),
    CONSTRAINT ck_experiencia_anos    CHECK (experiencia_anos >= 0),
    CONSTRAINT ck_tempo_resposta      CHECK (tempo_medio_resposta_minutos > 0 OR tempo_medio_resposta_minutos IS NULL)
);

CREATE INDEX idx_prestador_latitude_longitude ON prestador(latitude, longitude);
CREATE INDEX idx_prestador_status_disponibilidade ON prestador(status_disponibilidade);

-- ============================================================================
-- 3. DOCUMENTOS PRESTADOR (Verificação)
-- ============================================================================

CREATE TABLE documentos_prestador (
    id                SERIAL PRIMARY KEY,
    prestador_id      INT NOT NULL,
    tipo_documento    VARCHAR(50) NOT NULL,  -- CPF, CNPJ, COMPROVANTE_ENDERECO, IDENTIDADE
    arquivo_url       VARCHAR(500) NOT NULL,
    status            status_documento DEFAULT 'PENDENTE',
    motivo_rejeicao   TEXT,
    
    -- Auditoria
    submetido_em     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    analisado_em     TIMESTAMP,
    analisado_por    INT,                   -- ID do admin
    CONSTRAINT fk_documento_prestador     FOREIGN KEY(prestador_id)  REFERENCES prestador(usuario_id) ON DELETE CASCADE,
    CONSTRAINT fk_documento_analisado_por FOREIGN KEY(analisado_por) REFERENCES usuarios(id)        ON DELETE SET NULL
);

CREATE INDEX idx_documentos_prestador_id     ON documentos_prestador(prestador_id);
CREATE INDEX idx_documentos_prestador_status ON documentos_prestador(status);

-- ============================================================================
-- DOCUMENTOS CLIENTE (Verificação Opcional)
-- ============================================================================

CREATE TABLE documentos_cliente (
    id                      SERIAL PRIMARY KEY,
    cliente_id              INT NOT NULL,
    tipo_documento          VARCHAR(50) NOT NULL,  -- CPF, COMPROVANTE_ENDERECO, IDENTIDADE
    arquivo_url             VARCHAR(500) NOT NULL,
    status status_documento DEFAULT 'PENDENTE',
    motivo_rejeicao         TEXT,
    
    -- Auditoria
    submetido_em  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    analisado_em  TIMESTAMP,
    analisado_por INT,                   -- ID do admin
    
    CONSTRAINT fk_documento_cliente FOREIGN KEY(cliente_id) REFERENCES cliente(usuario_id) ON DELETE CASCADE,
    CONSTRAINT fk_documento_cliente_analisado_por FOREIGN KEY(analisado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_documentos_cliente_id ON documentos_cliente(cliente_id);
CREATE INDEX idx_documentos_cliente_status ON documentos_cliente(status);

-- ============================================================================
-- 4. CATEGORIAS (RAMOS DE ATUAÇÃO)
-- ============================================================================

CREATE TABLE categorias (
    id            SERIAL PRIMARY KEY,
    nome          VARCHAR(100) NOT NULL UNIQUE,
    slug          VARCHAR(100) UNIQUE NOT NULL,
    descricao     TEXT,
    icone_url     VARCHAR(500),
    ativo         BOOLEAN DEFAULT TRUE,
    criado_em     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categorias_slug  ON categorias(slug);
CREATE INDEX idx_categorias_ativo ON categorias(ativo);

-- Tabela: PRESTADOR_CATEGORIAS
-- Um prestador pode atuar em múltiplas categorias
CREATE TABLE prestador_categorias (
    prestador_id   INT NOT NULL,
    categoria_id   INT NOT NULL,
    adicionado_em  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (prestador_id, categoria_id),
    
    CONSTRAINT fk_prestador_categorias_prestador FOREIGN KEY(prestador_id) REFERENCES prestador(usuario_id) ON DELETE CASCADE,
    CONSTRAINT fk_prestador_categorias_categoria FOREIGN KEY(categoria_id) REFERENCES categorias(id)        ON DELETE CASCADE
);

CREATE INDEX idx_prestador_categorias_categoria ON prestador_categorias(categoria_id);

-- ============================================================================
-- 5. SERVIÇOS (Histórico de trabalhos realizados)
-- ============================================================================

CREATE TABLE servicos (
    id               SERIAL       PRIMARY KEY,
    prestador_id     INT          NOT NULL,
    categoria_id     INT,
    titulo           VARCHAR(200) NOT NULL,
    descricao        TEXT,
    valor_cobrado    NUMERIC(10,2),
    data_realizacao  DATE,
    criado_em        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_servico_prestador  FOREIGN KEY(prestador_id) REFERENCES prestador(usuario_id) ON DELETE CASCADE,
    CONSTRAINT fk_servico_categoria  FOREIGN KEY(categoria_id) REFERENCES categorias(id)        ON DELETE SET NULL
);

CREATE INDEX idx_servicos_prestador_id    ON servicos(prestador_id);
CREATE INDEX idx_servicos_categoria_id    ON servicos(categoria_id);
CREATE INDEX idx_servicos_data_realizacao ON servicos(data_realizacao);

-- Tabela: SERVICO_IMAGENS
CREATE TABLE servico_imagens (
    id          SERIAL PRIMARY KEY,
    servico_id  INT NOT NULL,
    imagem_url  VARCHAR(500) NOT NULL,
    ordem       INTEGER DEFAULT 1,
    criado_em   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_servico_imagem FOREIGN KEY(servico_id) REFERENCES servicos(id) ON DELETE CASCADE
);

CREATE INDEX idx_servico_imagens_servico_id ON servico_imagens(servico_id);

-- ============================================================================
-- 6. PORTFÓLIO (Feed de trabalhos)
-- ============================================================================

CREATE TABLE portfolios (
    id                  SERIAL PRIMARY KEY,
    prestador_id        INT NOT NULL,
    titulo              VARCHAR(200),
    descricao           TEXT,
    destaque            BOOLEAN DEFAULT FALSE,
    total_visualizacoes INTEGER DEFAULT 0,
    criado_em           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_portfolio_prestador FOREIGN KEY(prestador_id) REFERENCES prestador(usuario_id) ON DELETE CASCADE
);

CREATE INDEX idx_portfolio_prestador_id ON portfolios(prestador_id);
CREATE INDEX idx_portfolio_destaque ON portfolios(destaque);

-- Tabela: PORTFOLIO_IMAGENS
CREATE TABLE portfolio_imagens (
    id           SERIAL PRIMARY KEY,
    portfolio_id INT NOT NULL,
    imagem_url   VARCHAR(500) NOT NULL,
    ordem        INTEGER DEFAULT 1,
    criado_em    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_portfolio_imagem FOREIGN KEY(portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
);

CREATE INDEX idx_portfolio_imagens_portfolio_id ON portfolio_imagens(portfolio_id);

-- ============================================================================
-- 7. FAVORITOS
-- ============================================================================

CREATE TABLE favoritos (
    cliente_id    INT NOT NULL,
    prestador_id  INT NOT NULL,
    criado_em     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (cliente_id, prestador_id),
    
    CONSTRAINT fk_favorito_cliente  FOREIGN KEY(cliente_id)  REFERENCES cliente(usuario_id)   ON DELETE CASCADE,
    CONSTRAINT fk_favorito_prestador FOREIGN KEY(prestador_id) REFERENCES prestador(usuario_id) ON DELETE CASCADE
);

CREATE INDEX idx_favoritos_cliente_id ON favoritos(cliente_id);

-- ============================================================================
-- 8. SOLICITAÇÕES (Cliente pede orçamento a prestador)
-- ============================================================================

CREATE TABLE solicitacoes (
    id                    SERIAL PRIMARY KEY,
    cliente_id            INT NOT NULL,
    prestador_id          INT NOT NULL,
    categoria_id          INT,
    endereco_id           INT,
    endereco_atendimento  TEXT,
    titulo                VARCHAR(255) NOT NULL,
    descricao             TEXT NOT NULL,
    status                status_solicitacao DEFAULT 'ABERTA',
    
    -- Localização (do cliente, em tempo real no app, salvo aqui)
    latitude      NUMERIC(10,8),
    longitude     NUMERIC(11,8),
    
    criado_em     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_solicitacao_cliente   FOREIGN KEY(cliente_id)   REFERENCES cliente(usuario_id)   ON DELETE CASCADE,
    CONSTRAINT fk_solicitacao_prestador FOREIGN KEY(prestador_id) REFERENCES prestador(usuario_id) ON DELETE CASCADE,
    CONSTRAINT fk_solicitacao_categoria FOREIGN KEY(categoria_id) REFERENCES categorias(id)        ON DELETE SET NULL,
    CONSTRAINT fk_solicitacao_endereco  FOREIGN KEY(endereco_id)  REFERENCES enderecos(id)         ON DELETE SET NULL
);

CREATE INDEX idx_solicitacoes_cliente_id ON solicitacoes(cliente_id);
CREATE INDEX idx_solicitacoes_prestador_id ON solicitacoes(prestador_id);
CREATE INDEX idx_solicitacoes_status ON solicitacoes(status);
CREATE INDEX idx_solicitacoes_criado_em ON solicitacoes(criado_em DESC);

-- Tabela: SOLICITACAO_IMAGENS
CREATE TABLE solicitacao_imagens (
    id             SERIAL PRIMARY KEY,
    solicitacao_id INT NOT NULL,
    imagem_url     VARCHAR(500) NOT NULL,
    criado_em      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_solicitacao_imagem FOREIGN KEY(solicitacao_id) REFERENCES solicitacoes(id) ON DELETE CASCADE
);

CREATE INDEX idx_solicitacao_imagens_solicitacao_id ON solicitacao_imagens(solicitacao_id);

-- ============================================================================
-- 9. PROPOSTAS (Prestador responde com orçamento)
-- ============================================================================

CREATE TABLE propostas (
    id             SERIAL PRIMARY KEY,
    solicitacao_id INT NOT NULL,
    prestador_id   INT NOT NULL,
    valor_total    NUMERIC(10,2) NOT NULL,
    prazo_dias     INTEGER,
    descricao      TEXT,
    status         status_proposta DEFAULT 'ENVIADA',
    
    criado_em      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_proposta_solicitacao FOREIGN KEY(solicitacao_id) REFERENCES solicitacoes(id) ON DELETE CASCADE,
    CONSTRAINT fk_proposta_prestador   FOREIGN KEY(prestador_id)   REFERENCES prestador(usuario_id) ON DELETE CASCADE,
    CONSTRAINT ck_valor_total          CHECK (valor_total > 0),
    CONSTRAINT ck_prazo_dias           CHECK (prazo_dias > 0 OR prazo_dias IS NULL)
);

CREATE INDEX idx_propostas_solicitacao_id ON propostas(solicitacao_id);
CREATE INDEX idx_propostas_prestador_id ON propostas(prestador_id);
CREATE INDEX idx_propostas_status ON propostas(status);
CREATE INDEX idx_propostas_criado_em ON propostas(criado_em DESC);

-- Tabela: PROPOSTA_ITENS (Discriminação da proposta)
CREATE TABLE proposta_itens (
    id          SERIAL PRIMARY KEY,
    proposta_id INT NOT NULL,
    descricao   VARCHAR(255),
    valor       NUMERIC(10,2),
    quantidade  INT DEFAULT 1,
    
    CONSTRAINT fk_proposta_item FOREIGN KEY(proposta_id) REFERENCES propostas(id) ON DELETE CASCADE,
    CONSTRAINT ck_valor_item    CHECK (valor > 0),
    CONSTRAINT ck_quantidade_item CHECK (quantidade > 0)
);

CREATE INDEX idx_proposta_itens_proposta_id ON proposta_itens(proposta_id);

-- ============================================================================
-- 10. PEDIDOS (Proposta aceita vira pedido)
-- ============================================================================

CREATE TABLE pedidos (
    id                    SERIAL PRIMARY KEY,
    proposta_id           INT UNIQUE NOT NULL,
    cliente_id            INT NOT NULL,
    prestador_id          INT NOT NULL,
    endereco_id           INT,
    endereco_atendimento  TEXT,
    valor_final           NUMERIC(10,2),
    status                status_pedido DEFAULT 'AGUARDANDO_ACEITE',
    
    agendado_para TIMESTAMP,
    iniciado_em   TIMESTAMP,
    concluido_em  TIMESTAMP,
    
    criado_em     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP,
    
    CONSTRAINT fk_pedido_proposta   FOREIGN KEY(proposta_id)  REFERENCES propostas(id)          ON DELETE CASCADE,
    CONSTRAINT fk_pedido_cliente    FOREIGN KEY(cliente_id)   REFERENCES cliente(usuario_id)    ON DELETE CASCADE,
    CONSTRAINT fk_pedido_prestador  FOREIGN KEY(prestador_id) REFERENCES prestador(usuario_id)  ON DELETE CASCADE,
    CONSTRAINT fk_pedido_endereco   FOREIGN KEY(endereco_id)  REFERENCES enderecos(id)          ON DELETE SET NULL,
    CONSTRAINT ck_valor_final       CHECK (valor_final > 0 OR valor_final IS NULL)
);

CREATE INDEX idx_pedidos_cliente_id ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_prestador_id ON pedidos(prestador_id);
CREATE INDEX idx_pedidos_status ON pedidos(status);
CREATE INDEX idx_pedidos_criado_em ON pedidos(criado_em DESC);

-- ============================================================================
-- 11. CONVERSAS (Chat entre cliente e prestador)
-- ============================================================================

CREATE TABLE conversas (
    id            SERIAL PRIMARY KEY,
    pedido_id     INT,                     -- Pode ser NULL se conversa for antes do pedido
    cliente_id    INT NOT NULL,
    prestador_id  INT NOT NULL,
    criado_em     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP,
    
    CONSTRAINT fk_conversa_pedido    FOREIGN KEY(pedido_id)    REFERENCES pedidos(id)          ON DELETE SET NULL,
    CONSTRAINT fk_conversa_cliente   FOREIGN KEY(cliente_id)   REFERENCES cliente(usuario_id)   ON DELETE CASCADE,
    CONSTRAINT fk_conversa_prestador FOREIGN KEY(prestador_id) REFERENCES prestador(usuario_id) ON DELETE CASCADE
);

CREATE INDEX idx_conversas_pedido_id     ON conversas(pedido_id);
CREATE INDEX idx_conversas_cliente_id    ON conversas(cliente_id);
CREATE INDEX idx_conversas_prestador_id  ON conversas(prestador_id);
CREATE INDEX idx_conversas_atualizado_em ON conversas(atualizado_em DESC);

-- Tabela: MENSAGENS
CREATE TABLE mensagens (
    id           SERIAL PRIMARY KEY,
    conversa_id  INT NOT NULL,
    remetente_id INT NOT NULL,
    tipo         tipo_mensagem DEFAULT 'TEXTO',
    conteudo     TEXT,
    lida         BOOLEAN DEFAULT FALSE,
    lida_em      TIMESTAMP,
    
    enviado_em   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_mensagem_conversa  FOREIGN KEY(conversa_id)  REFERENCES conversas(id) ON DELETE CASCADE,
    CONSTRAINT fk_mensagem_remetente FOREIGN KEY(remetente_id) REFERENCES usuarios(id)  ON DELETE CASCADE
);

CREATE INDEX idx_mensagens_conversa_id ON mensagens(conversa_id);
CREATE INDEX idx_mensagens_remetente_id ON mensagens(remetente_id);
CREATE INDEX idx_mensagens_lida ON mensagens(lida);
CREATE INDEX idx_mensagens_enviado_em ON mensagens(enviado_em DESC);

-- Tabela: MENSAGEM_ANEXOS
CREATE TABLE mensagem_anexos (
    id            SERIAL PRIMARY KEY,
    mensagem_id   INT NOT NULL,
    arquivo_url   VARCHAR(500),
    tipo_arquivo  VARCHAR(30),
    tamanho_bytes INT,
    
    CONSTRAINT fk_anexo_mensagem FOREIGN KEY(mensagem_id) REFERENCES mensagens(id) ON DELETE CASCADE
);

CREATE INDEX idx_mensagem_anexos_mensagem_id ON mensagem_anexos(mensagem_id);

-- ============================================================================
-- 12. AVALIAÇÕES
-- ============================================================================

CREATE TABLE avaliacoes (
    id           SERIAL PRIMARY KEY,
    pedido_id    INT UNIQUE NOT NULL,
    prestador_id INT NOT NULL,
    cliente_id   INT NOT NULL,
    nota         INT NOT NULL,
    comentario   TEXT,
    
    criado_em     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_avaliacao_pedido      FOREIGN KEY(pedido_id)    REFERENCES pedidos(id)           ON DELETE CASCADE,
    CONSTRAINT fk_avaliacao_prestador   FOREIGN KEY(prestador_id) REFERENCES prestador(usuario_id) ON DELETE CASCADE,
    CONSTRAINT fk_avaliacao_cliente     FOREIGN KEY(cliente_id)   REFERENCES cliente(usuario_id)   ON DELETE CASCADE,
    CONSTRAINT ck_nota_range           CHECK (nota >= 1 AND nota <= 5)
);

CREATE INDEX idx_avaliacoes_prestador_id ON avaliacoes(prestador_id);
CREATE INDEX idx_avaliacoes_cliente_id ON avaliacoes(cliente_id);
CREATE INDEX idx_avaliacoes_criado_em ON avaliacoes(criado_em DESC);

-- ============================================================================
-- 13. DENÚNCIAS
-- ============================================================================

CREATE TABLE denuncias (
    id                      SERIAL PRIMARY KEY,
    usuario_denunciante_id INT NOT NULL,
    usuario_denunciado_id  INT NOT NULL,
    tipo_denuncia          tipo_denuncia NOT NULL,
    motivo                 TEXT NOT NULL,
    descricao              TEXT,
    status                 status_denuncia DEFAULT 'ABERTA',
    
    -- Análise
    analisado_por          INT,            -- ID do admin
    resultado              TEXT,
    
    criado_em              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    analisado_em           TIMESTAMP,
    
    CONSTRAINT fk_denuncia_denunciante  FOREIGN KEY(usuario_denunciante_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_denuncia_denunciado   FOREIGN KEY(usuario_denunciado_id)  REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_denuncia_analisado_por FOREIGN KEY(analisado_por)         REFERENCES usuarios(id) ON DELETE SET NULL,
    CONSTRAINT ck_usuarios_diferentes CHECK (usuario_denunciante_id != usuario_denunciado_id)
);

CREATE INDEX idx_denuncias_denunciante_id ON denuncias(usuario_denunciante_id);
CREATE INDEX idx_denuncias_denunciado_id ON denuncias(usuario_denunciado_id);
CREATE INDEX idx_denuncias_status ON denuncias(status);
CREATE INDEX idx_denuncias_criado_em ON denuncias(criado_em DESC);

-- ============================================================================
-- 14. AUDITORIA (Rastreamento de mudanças)
-- ============================================================================

CREATE TABLE audit_log (
    id               SERIAL PRIMARY KEY,
    usuario_id       INT,                  -- Quem fez a ação (pode ser NULL para sistema)
    tabela_afetada   VARCHAR(100) NOT NULL,
    id_registro      INT,
    acao             VARCHAR(50) NOT NULL, -- INSERT, UPDATE, DELETE
    dados_antes      JSONB,                -- Estado anterior (para UPDATE/DELETE)
    dados_depois     JSONB,                -- Estado novo (para INSERT/UPDATE)
    ip_address       VARCHAR(45),          -- IPv4 ou IPv6
    user_agent       TEXT,
    criado_em        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_audit_usuario FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_usuario_id ON audit_log(usuario_id);
CREATE INDEX idx_audit_tabela_afetada ON audit_log(tabela_afetada);
CREATE INDEX idx_audit_criado_em ON audit_log(criado_em DESC);
CREATE INDEX idx_audit_acao ON audit_log(acao);

-- ============================================================================
-- 15. NOTIFICAÇÕES
-- ============================================================================

CREATE TABLE notificacoes (
    id                SERIAL PRIMARY KEY,
    usuario_id        INT NOT NULL,
    titulo            VARCHAR(150),
    mensagem          TEXT,
    tipo              VARCHAR(50),         -- NOVA_MENSAGEM, PROPOSTA_RECEBIDA, PEDIDO_ACEITO, etc
    referencia_tabela VARCHAR(50),
    referencia_id     INT,
    lida              BOOLEAN DEFAULT FALSE,
    lida_em           TIMESTAMP,
    
    criado_em         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_notificacao_usuario FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX idx_notificacoes_usuario_id ON notificacoes(usuario_id);
CREATE INDEX idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX idx_notificacoes_criado_em ON notificacoes(criado_em DESC);

-- ============================================================================
-- 16. PAPÉIS E PERMISSÕES INICIAIS
-- ============================================================================

INSERT INTO roles (nome, descricao)
VALUES
    ('CLIENTE', 'Acesso às funcionalidades de cliente'),
    ('PRESTADOR', 'Acesso às funcionalidades de prestador'),
    ('ADMIN_MASTER', 'Acesso total ao painel administrativo'),
    ('SUPORTE', 'Atendimento e consulta de usuários'),
    ('MODERACAO', 'Análise de denúncias e conteúdos'),
    ('FINANCEIRO', 'Consulta e gestão financeira'),
    ('ANALISTA', 'Consulta de dados e relatórios')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO permissoes (nome, descricao, recurso, acao)
VALUES
    ('USUARIOS_VISUALIZAR', 'Visualizar usuários', 'USUARIOS', 'VISUALIZAR'),
    ('USUARIOS_EDITAR', 'Editar usuários', 'USUARIOS', 'EDITAR'),
    ('PRESTADORES_VISUALIZAR', 'Visualizar prestadores', 'PRESTADORES', 'VISUALIZAR'),
    ('PRESTADORES_APROVAR', 'Aprovar documentos de prestadores', 'PRESTADORES', 'APROVAR'),
    ('CATEGORIAS_VISUALIZAR', 'Visualizar categorias', 'CATEGORIAS', 'VISUALIZAR'),
    ('CATEGORIAS_EDITAR', 'Criar, editar e desativar categorias', 'CATEGORIAS', 'EDITAR'),
    ('DENUNCIAS_VISUALIZAR', 'Visualizar denúncias', 'DENUNCIAS', 'VISUALIZAR'),
    ('DENUNCIAS_ANALISAR', 'Analisar e encerrar denúncias', 'DENUNCIAS', 'ANALISAR'),
    ('MENSAGENS_MODERAR', 'Moderar mensagens denunciadas', 'MENSAGENS', 'MODERAR'),
    ('FINANCEIRO_VISUALIZAR', 'Visualizar informações financeiras', 'FINANCEIRO', 'VISUALIZAR'),
    ('FINANCEIRO_EDITAR', 'Editar informações financeiras', 'FINANCEIRO', 'EDITAR'),
    ('RELATORIOS_VISUALIZAR', 'Visualizar relatórios', 'RELATORIOS', 'VISUALIZAR'),
    ('SOLICITACOES_CRIAR', 'Criar solicitações de serviço', 'SOLICITACOES', 'CRIAR'),
    ('PROPOSTAS_CRIAR', 'Enviar propostas de serviço', 'PROPOSTAS', 'CRIAR'),
    ('PEDIDOS_VISUALIZAR', 'Visualizar pedidos relacionados ao usuário', 'PEDIDOS', 'VISUALIZAR'),
    ('AVALIACOES_CRIAR', 'Criar avaliações de pedidos concluídos', 'AVALIACOES', 'CRIAR')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO role_permissoes (role_id, permissao_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissoes p
WHERE r.nome = 'ADMIN_MASTER'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissoes (role_id, permissao_id)
SELECT r.id, p.id
FROM roles r
JOIN permissoes p ON p.nome IN (
    'USUARIOS_VISUALIZAR',
    'PRESTADORES_VISUALIZAR',
    'DENUNCIAS_VISUALIZAR',
    'DENUNCIAS_ANALISAR',
    'MENSAGENS_MODERAR'
)
WHERE r.nome = 'MODERACAO'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissoes (role_id, permissao_id)
SELECT r.id, p.id
FROM roles r
JOIN permissoes p ON p.nome IN (
    'USUARIOS_VISUALIZAR',
    'PRESTADORES_VISUALIZAR',
    'FINANCEIRO_VISUALIZAR',
    'FINANCEIRO_EDITAR',
    'RELATORIOS_VISUALIZAR'
)
WHERE r.nome = 'FINANCEIRO'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissoes (role_id, permissao_id)
SELECT r.id, p.id
FROM roles r
JOIN permissoes p ON p.nome IN (
    'USUARIOS_VISUALIZAR',
    'PRESTADORES_VISUALIZAR',
    'RELATORIOS_VISUALIZAR'
)
WHERE r.nome IN ('SUPORTE', 'ANALISTA')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissoes (role_id, permissao_id)
SELECT r.id, p.id
FROM roles r
JOIN permissoes p ON p.nome IN (
    'SOLICITACOES_CRIAR',
    'PEDIDOS_VISUALIZAR',
    'AVALIACOES_CRIAR'
)
WHERE r.nome = 'CLIENTE'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissoes (role_id, permissao_id)
SELECT r.id, p.id
FROM roles r
JOIN permissoes p ON p.nome IN (
    'PROPOSTAS_CRIAR',
    'PEDIDOS_VISUALIZAR',
    'AVALIACOES_CRIAR'
)
WHERE r.nome = 'PRESTADOR'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VIEWS ÚTEIS
-- ============================================================================

-- View: Prestadores ativos com média de avaliações
CREATE VIEW vw_prestadores_ativos AS
SELECT 
    p.usuario_id,
    u.nome,
    p.nome_fantasia,
    p.capa_url,
    u.email,
    p.latitude,
    p.longitude,
    p.raio_atendimento_km,
    p.status_disponibilidade,
    p.selo_superprestador,
    p.tempo_medio_resposta_minutos,
    u.media_avaliacao,
    u.total_avaliacoes,
    STRING_AGG(DISTINCT c.nome, ', ') AS categorias
FROM prestador p
INNER JOIN usuarios u ON p.usuario_id = u.id
LEFT JOIN prestador_categorias pc ON p.usuario_id = pc.prestador_id
LEFT JOIN categorias c ON pc.categoria_id = c.id
WHERE u.status_conta = 'ATIVA' 
    AND p.status_disponibilidade != 'INATIVO'
GROUP BY p.usuario_id, u.nome, p.nome_fantasia, p.capa_url, u.email, p.latitude, p.longitude,
         p.raio_atendimento_km, p.status_disponibilidade, p.selo_superprestador,
         p.tempo_medio_resposta_minutos, u.media_avaliacao, u.total_avaliacoes;

-- View: Estatísticas por prestador
CREATE VIEW vw_estatisticas_prestador AS
SELECT 
    p.usuario_id,
    u.nome,
    COUNT(DISTINCT pd.id) AS total_pedidos,
    COUNT(DISTINCT av.id) AS total_avaliacoes,
    AVG(av.nota) AS media_avaliacoes,
    COUNT(DISTINCT s.id) AS total_servicos_realizados
FROM prestador p
LEFT JOIN pedidos pd ON p.usuario_id = pd.prestador_id
LEFT JOIN avaliacoes av ON p.usuario_id = av.prestador_id
LEFT JOIN servicos s ON p.usuario_id = s.prestador_id
LEFT JOIN usuarios u ON p.usuario_id = u.id
GROUP BY p.usuario_id, u.nome;

-- ============================================================================
-- FUNÇÃO: Atualizar timestamp de atualizado_em
-- ============================================================================

CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar atualizado_em
CREATE TRIGGER trigger_usuarios_atualizado_em
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION update_atualizado_em();

CREATE TRIGGER trigger_prestador_atualizado_em
BEFORE UPDATE ON prestador
FOR EACH ROW
EXECUTE FUNCTION update_atualizado_em();

CREATE TRIGGER trigger_cliente_atualizado_em
BEFORE UPDATE ON cliente
FOR EACH ROW
EXECUTE FUNCTION update_atualizado_em();

CREATE TRIGGER trigger_enderecos_atualizado_em
BEFORE UPDATE ON enderecos
FOR EACH ROW
EXECUTE FUNCTION update_atualizado_em();

CREATE TRIGGER trigger_conversas_atualizado_em
BEFORE UPDATE ON conversas
FOR EACH ROW
EXECUTE FUNCTION update_atualizado_em();

CREATE TRIGGER trigger_avaliacoes_atualizado_em
BEFORE UPDATE ON avaliacoes
FOR EACH ROW
EXECUTE FUNCTION update_atualizado_em();

CREATE TRIGGER trigger_pedidos_atualizado_em
BEFORE UPDATE ON pedidos
FOR EACH ROW
EXECUTE FUNCTION update_atualizado_em();

CREATE TRIGGER trigger_solicitacoes_atualizado_em
BEFORE UPDATE ON solicitacoes
FOR EACH ROW
EXECUTE FUNCTION update_atualizado_em();

-- ============================================================================
-- FUNÇÃO: Atualizar média de avaliações do prestador
-- ============================================================================

CREATE OR REPLACE FUNCTION atualizar_media_avaliacoes()
RETURNS TRIGGER AS $$
DECLARE
    prestador_afetado INT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        prestador_afetado := OLD.prestador_id;
    ELSE
        prestador_afetado := NEW.prestador_id;
    END IF;

    UPDATE usuarios
    SET 
        media_avaliacao = COALESCE((
            SELECT AVG(nota)::NUMERIC(3,2)
            FROM avaliacoes
            WHERE prestador_id = prestador_afetado
        ), 0),
        total_avaliacoes = (
            SELECT COUNT(*)
            FROM avaliacoes
            WHERE prestador_id = prestador_afetado
        )
    WHERE id = prestador_afetado;

    IF TG_OP = 'UPDATE' AND OLD.prestador_id IS DISTINCT FROM NEW.prestador_id THEN
        UPDATE usuarios
        SET
            media_avaliacao = COALESCE((
                SELECT AVG(nota)::NUMERIC(3,2)
                FROM avaliacoes
                WHERE prestador_id = OLD.prestador_id
            ), 0),
            total_avaliacoes = (
                SELECT COUNT(*)
                FROM avaliacoes
                WHERE prestador_id = OLD.prestador_id
            )
        WHERE id = OLD.prestador_id;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_media_avaliacoes
AFTER INSERT OR UPDATE OR DELETE ON avaliacoes
FOR EACH ROW
EXECUTE FUNCTION atualizar_media_avaliacoes();

-- ============================================================================
-- FIM DO SCHEMA
-- ============================================================================