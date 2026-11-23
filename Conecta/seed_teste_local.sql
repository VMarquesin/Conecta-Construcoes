-- ============================================================================
-- seed_teste_local.sql
-- Script de Seed Completo e Idempotente para Ambiente Local e Apresentação do MVP
-- Conecta Construções - Banco de Dados PostgreSQL (monorepo_db)
-- ============================================================================
-- ESCOPO DA MASSA DE DADOS:
-- - 1 Administrador Master (admin@conecta.com)
-- - 3 Clientes Reais (matheus@conecta.com, mariana@conecta.com, fernanda@conecta.com)
-- - 5 Prestadores de Serviços Profissionais (Eletricista, Encanador, Pintor, Pedreira, Limpeza)
-- - Estados, Cidades e Endereços completos (Geolocalização / Raio de Atendimento)
-- - Categorias oficiais alinhadas ao Frontend React
-- - Portfólios com fotos HD, Documentos Verificados e Avaliações 5 estrelas
-- - Solicitações, Propostas, Pedidos e Conversas no Chat prontas para demonstração
--
-- SENHA PADRÃO DE TODOS OS USUÁRIOS: admin123
-- ============================================================================

SET client_encoding = 'UTF8';

BEGIN;

-- Garantir que a coluna status da tabela pedidos seja do tipo enum nativo status_pedido
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pedidos' 
          AND column_name = 'status' 
          AND data_type = 'character varying'
    ) THEN
        ALTER TABLE pedidos 
            ALTER COLUMN status DROP DEFAULT,
            ALTER COLUMN status TYPE status_pedido USING (
                CASE 
                    WHEN status = 'PENDENTE' THEN 'AGUARDANDO_ACEITE'::status_pedido
                    WHEN status = 'ACEITO' THEN 'AGENDADO'::status_pedido
                    WHEN status = 'RECUSADO' THEN 'CANCELADO'::status_pedido
                    ELSE status::status_pedido
                END
            ),
            ALTER COLUMN status SET DEFAULT 'AGUARDANDO_ACEITE'::status_pedido;
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 1. ESTADOS E CIDADES (Suporte a Endereços e Busca Geoespacial)
-- ----------------------------------------------------------------------------
INSERT INTO estados (sigla, nome)
VALUES 
    ('SP', 'São Paulo'),
    ('PR', 'Paraná'),
    ('RJ', 'Rio de Janeiro')
ON CONFLICT (sigla) DO NOTHING;

INSERT INTO cidades (estado_id, nome)
SELECT e.id, c.nome
FROM (VALUES 
    ('SP', 'Tupã'),
    ('SP', 'Marília'),
    ('SP', 'Bauru'),
    ('SP', 'São Paulo'),
    ('SP', 'Campinas')
) AS c(sigla, nome)
INNER JOIN estados e ON e.sigla = c.sigla
WHERE NOT EXISTS (
    SELECT 1 FROM cidades ci WHERE ci.estado_id = e.id AND ci.nome = c.nome
);

-- Corrigir eventuais nomes corrompidos de cidades provenientes de execuções anteriores com encoding incorreto
UPDATE cidades SET nome = 'Tupã' WHERE nome LIKE 'Tup%' OR nome LIKE 'Tup__';
UPDATE cidades SET nome = 'Marília' WHERE nome LIKE 'Mar%lia' OR nome LIKE 'Mar__lia';
UPDATE cidades SET nome = 'São Paulo' WHERE nome LIKE 'S%o Paulo' OR nome LIKE 'S__o Paulo';

-- ----------------------------------------------------------------------------
-- 2. CATEGORIAS DE SERVIÇOS (Compatibilidade com a Vitrine e Filtros do Front)
-- ----------------------------------------------------------------------------
INSERT INTO categorias (nome, slug, descricao, icone_url, ativo)
VALUES
    ('Instalações Elétricas', 'eletrica', 'Quadros elétricos, fiação completa, tomadas, disjuntores e iluminação LED', 'zap', TRUE),
    ('Instalações Hidráulicas', 'hidraulica', 'Encanamentos, caixas d água, reparos de vazamento, válvulas e torneiras', 'droplet', TRUE),
    ('Pintura e Acabamento', 'pintura', 'Pintura residencial e predial, texturas, efeitos decorativos e vernizes', 'brush', TRUE),
    ('Reformas e Alvenaria', 'reformas', 'Construção, demolição, reboco, assentamento de pisos, porcelanatos e azulejos', 'hammer', TRUE),
    ('Limpeza Pós-Obra', 'limpeza', 'Higienização profunda, remoção de resíduos, vidros e polimento pós-reforma', 'sparkles', TRUE),
    ('Marcenaria e Planejados', 'marcenaria', 'Móveis sob medida, restaurações, portas e montagem de armários', 'tool', TRUE),
    ('Serralheria e Portões', 'serralheria', 'Grades de proteção, corrimãos, portões eletrônicos e estruturas metálicas', 'shield', TRUE),
    ('Gesso e Drywall', 'gesso', 'Rebaixamento de teto, sancas iluminadas, divisórias drywall e molduras', 'box', TRUE)
ON CONFLICT (slug) DO UPDATE
SET 
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    icone_url = EXCLUDED.icone_url,
    ativo = TRUE;

-- ----------------------------------------------------------------------------
-- 3. USUÁRIOS (1 Admin, 3 Clientes, 5 Prestadores)
-- Senha de todos: admin123
-- ----------------------------------------------------------------------------
INSERT INTO usuarios (
    email, senha_hash, perfil, nome, documento, verificado, foto_perfil_url, 
    media_avaliacao, total_avaliacoes, status_conta, status_verificacao, ativo, 
    termos_aceitos_em, data_criacao, criado_em, atualizado_em
)
VALUES
    -- 3.1 Administrador
    (
        'admin@conecta.com', 'admin123', 'ADMIN', 'Admin Master Conecta', '00.000.000/0001-00', 
        TRUE, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        5.00, 0, 'ATIVA', 'COMPLETO', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    -- 3.2 Clientes
    (
        'matheus@conecta.com', 'admin123', 'CLIENTE', 'Matheus Oliveira (Cliente)', '123.456.789-01', 
        TRUE, 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
        5.00, 4, 'ATIVA', 'COMPLETO', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'mariana@conecta.com', 'admin123', 'CLIENTE', 'Mariana Lopes', '234.567.890-12', 
        TRUE, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
        5.00, 2, 'ATIVA', 'COMPLETO', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'fernanda@conecta.com', 'admin123', 'CLIENTE', 'Fernanda Castro', '345.678.901-23', 
        TRUE, 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
        4.90, 3, 'ATIVA', 'COMPLETO', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    -- 3.3 Prestadores de Serviços
    (
        'carlos@conecta.com', 'admin123', 'PRESTADOR', 'Carlos Silva', '456.789.012-34', 
        TRUE, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
        4.95, 34, 'ATIVA', 'VERIFICADO', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'roberto@conecta.com', 'admin123', 'PRESTADOR', 'Roberto Almeida', '567.890.123-45', 
        TRUE, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
        4.85, 27, 'ATIVA', 'VERIFICADO', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'lucas@conecta.com', 'admin123', 'PRESTADOR', 'Lucas Mendes', '678.901.234-56', 
        TRUE, 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80',
        4.90, 19, 'ATIVA', 'VERIFICADO', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'juliana@conecta.com', 'admin123', 'PRESTADOR', 'Juliana Ramos', '789.012.345-67', 
        TRUE, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
        5.00, 42, 'ATIVA', 'VERIFICADO', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'marcelo@conecta.com', 'admin123', 'PRESTADOR', 'Marcelo Silveira', '890.123.456-78', 
        TRUE, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
        4.80, 15, 'ATIVA', 'VERIFICADO', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
ON CONFLICT (email) DO UPDATE
SET 
    senha_hash = EXCLUDED.senha_hash,
    nome = EXCLUDED.nome,
    perfil = EXCLUDED.perfil,
    foto_perfil_url = EXCLUDED.foto_perfil_url,
    status_conta = 'ATIVA',
    status_verificacao = EXCLUDED.status_verificacao,
    ativo = TRUE;

-- ----------------------------------------------------------------------------
-- 4. ROLES E ASSOCIAÇÃO (RBAC)
-- ----------------------------------------------------------------------------
INSERT INTO roles (nome, descricao)
VALUES
    ('CLIENTE', 'Acesso às funcionalidades de cliente'),
    ('PRESTADOR', 'Acesso às funcionalidades de prestador'),
    ('ADMIN_MASTER', 'Acesso total ao painel administrativo')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO usuario_roles (usuario_id, role_id)
SELECT u.id, r.id
FROM usuarios u
CROSS JOIN roles r
WHERE 
    (u.email = 'admin@conecta.com' AND r.nome = 'ADMIN_MASTER') OR
    (u.email IN ('matheus@conecta.com', 'mariana@conecta.com', 'fernanda@conecta.com') AND r.nome = 'CLIENTE') OR
    (u.email IN ('carlos@conecta.com', 'roberto@conecta.com', 'lucas@conecta.com', 'juliana@conecta.com', 'marcelo@conecta.com') AND r.nome = 'PRESTADOR')
ON CONFLICT (usuario_id, role_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. TABELA CLIENTE (E COMPATIBILIDADE COM CLIENTES LEGADA)
-- ----------------------------------------------------------------------------
INSERT INTO cliente (usuario_id, ativo)
SELECT id, TRUE 
FROM usuarios 
WHERE email IN ('matheus@conecta.com', 'mariana@conecta.com', 'fernanda@conecta.com')
ON CONFLICT (usuario_id) DO UPDATE SET ativo = TRUE;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clientes') THEN
        INSERT INTO clientes (usuario_id, nome_completo)
        SELECT id, nome
        FROM usuarios
        WHERE email IN ('matheus@conecta.com', 'mariana@conecta.com', 'fernanda@conecta.com')
        ON CONFLICT (usuario_id) DO UPDATE SET nome_completo = EXCLUDED.nome_completo;
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 6. TABELA PRESTADOR (E COMPATIBILIDADE COM PRESTADORES LEGADA)
-- Coordenadas realistas (Interior de SP: Tupã, Marília, Bauru)
-- ----------------------------------------------------------------------------
INSERT INTO prestador (
    usuario_id, nome_fantasia, bio, experiencia_anos, valor_hora_inicial, capa_url, 
    latitude, longitude, raio_atendimento_km, status_disponibilidade, plano_assinatura, 
    destaque_regiao, selo_superprestador, tempo_medio_resposta_minutos
)
SELECT 
    u.id, 
    p.nome_fantasia, 
    p.bio, 
    p.experiencia_anos, 
    p.valor_hora_inicial, 
    p.capa_url, 
    p.latitude, 
    p.longitude, 
    p.raio_atendimento_km, 
    p.status_disponibilidade::status_disponibilidade, 
    p.plano_assinatura, 
    p.destaque_regiao, 
    p.selo_superprestador, 
    p.tempo_medio_resposta_minutos
FROM (VALUES
    (
        'carlos@conecta.com',
        'Carlos Instalações Elétricas',
        'Especialista em instalações elétricas residenciais e comerciais com certificação NR-10 e NR-35. Focado em quadros de distribuição, iluminação LED arquitetural e padrões de entrada CPFL. Atendimento rápido e laudo técnico com garantia.',
        8, 85.00,
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
        -21.93470000, -50.51360000, 35,
        'DISPONIVEL', 'P', TRUE, TRUE, 12
    ),
    (
        'roberto@conecta.com',
        'HidroReparos e Desentupidora Marília',
        'Profissional com mais de 12 anos em manutenção hidráulica preventiva e corretiva. Localização eletrônica de vazamentos ocultos sem quebra-quebra, instalação de metais nobres e redes de água quente/PPR.',
        12, 75.00,
        'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=1200&q=80',
        -22.21390000, -49.94580000, 25,
        'DISPONIVEL', 'P', TRUE, FALSE, 20
    ),
    (
        'lucas@conecta.com',
        'Mendes Pinturas e Acabamentos Finos',
        'Pintor especializado em pintura imobiliária de alto padrão, aplicação de cimento queimado, efeitos marmorizados, vernizes UV e impermeabilização de fachadas com equipamentos airless de última geração.',
        6, 65.00,
        'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80',
        -21.93800000, -50.51800000, 20,
        'DISPONIVEL', 'G', FALSE, TRUE, 15
    ),
    (
        'juliana@conecta.com',
        'JR Reformas e Alvenaria Estrutural',
        'Mestre de obras e empreiteira dedicada a reformas completas, alvenaria de vedação e estrutural, assentamento de porcelanatos grandes formatos e construção civil sustentável. Equipe disciplinada e pontual.',
        10, 95.00,
        'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=1200&q=80',
        -22.31450000, -49.05870000, 40,
        'DISPONIVEL', 'P', TRUE, TRUE, 10
    ),
    (
        'marcelo@conecta.com',
        'CleanMaster Limpeza Pós-Obra',
        'Empresa técnica em limpeza pesada e desincrustação pós-construção. Remoção técnica de tintas, argamassa e colas em pisos nobres sem danificar superfícies. Higienização pronta para mudança imediata.',
        5, 55.00,
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
        -21.94000000, -50.51000000, 15,
        'DISPONIVEL', 'G', FALSE, FALSE, 30
    )
) AS p(
    email, nome_fantasia, bio, experiencia_anos, valor_hora_inicial, capa_url, 
    latitude, longitude, raio_atendimento_km, status_disponibilidade, plano_assinatura, 
    destaque_regiao, selo_superprestador, tempo_medio_resposta_minutos
)
INNER JOIN usuarios u ON u.email = p.email
ON CONFLICT (usuario_id) DO UPDATE
SET 
    nome_fantasia = EXCLUDED.nome_fantasia,
    bio = EXCLUDED.bio,
    experiencia_anos = EXCLUDED.experiencia_anos,
    valor_hora_inicial = EXCLUDED.valor_hora_inicial,
    capa_url = EXCLUDED.capa_url,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    raio_atendimento_km = EXCLUDED.raio_atendimento_km,
    status_disponibilidade = EXCLUDED.status_disponibilidade,
    plano_assinatura = EXCLUDED.plano_assinatura,
    destaque_regiao = EXCLUDED.destaque_regiao,
    selo_superprestador = EXCLUDED.selo_superprestador,
    tempo_medio_resposta_minutos = EXCLUDED.tempo_medio_resposta_minutos;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prestadores') THEN
        INSERT INTO prestadores (usuario_id, nome_fantasia, bio, plano_assinatura, status_disponibilidade)
        SELECT usuario_id, nome_fantasia, bio, plano_assinatura, status_disponibilidade::text
        FROM prestador
        ON CONFLICT (usuario_id) DO UPDATE
        SET 
            nome_fantasia = EXCLUDED.nome_fantasia,
            bio = EXCLUDED.bio,
            plano_assinatura = EXCLUDED.plano_assinatura,
            status_disponibilidade = EXCLUDED.status_disponibilidade;
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 7. ENDEREÇOS E TELEFONES DOS USUÁRIOS
-- ----------------------------------------------------------------------------
-- Limpar endereços e telefones dos usuários de teste antes de recriá-los com encoding correto
DELETE FROM enderecos WHERE usuario_id IN (
    SELECT id FROM usuarios WHERE email IN (
        'admin@conecta.com', 'matheus@conecta.com', 'mariana@conecta.com', 'fernanda@conecta.com',
        'carlos@conecta.com', 'roberto@conecta.com', 'lucas@conecta.com', 'juliana@conecta.com', 'marcelo@conecta.com'
    )
);

DELETE FROM telefones WHERE usuario_id IN (
    SELECT id FROM usuarios WHERE email IN (
        'admin@conecta.com', 'matheus@conecta.com', 'mariana@conecta.com', 'fernanda@conecta.com',
        'carlos@conecta.com', 'roberto@conecta.com', 'lucas@conecta.com', 'juliana@conecta.com', 'marcelo@conecta.com'
    )
);

INSERT INTO enderecos (
    usuario_id, cidade_id, bairro, cep, latitude, longitude, principal, 
    apelido, logradouro, numero, complemento, cidade, estado
)
SELECT 
    u.id, 
    c.id, 
    e.bairro, 
    e.cep, 
    e.latitude, 
    e.longitude, 
    TRUE, 
    'Principal', 
    e.logradouro, 
    e.numero, 
    e.complemento, 
    c.nome, 
    'SP'
FROM (VALUES
    ('admin@conecta.com', 'Tupã', 'Centro', '17600-010', -21.9347, -50.5136, 'Av. Tamoios', '1000', 'Sala 42'),
    ('matheus@conecta.com', 'Tupã', 'Vila Vargas', '17601-250', -21.9320, -50.5100, 'Rua Aimorés', '452', 'Apto 101'),
    ('mariana@conecta.com', 'Marília', 'Jardim Esplanada', '17525-000', -22.2150, -49.9400, 'Av. das Esmeraldas', '850', 'Casa'),
    ('fernanda@conecta.com', 'Bauru', 'Altos da Cidade', '17014-000', -22.3200, -49.0600, 'Rua Gustavo Maciel', '15-40', 'Edifício Panorama'),
    ('carlos@conecta.com', 'Tupã', 'Centro', '17600-120', -21.9347, -50.5136, 'Rua Cherentes', '730', 'Loja Elétrica'),
    ('roberto@conecta.com', 'Marília', 'Centro', '17500-020', -22.2139, -49.9458, 'Rua 9 de Julho', '1120', 'Galpão 2'),
    ('lucas@conecta.com', 'Tupã', 'Jardim Paulista', '17605-100', -21.9380, -50.5180, 'Rua Coroados', '315', NULL),
    ('juliana@conecta.com', 'Bauru', 'Vila Universitária', '17012-010', -22.3145, -49.0587, 'Rua Araújo Leite', '22-80', 'Escritório'),
    ('marcelo@conecta.com', 'Tupã', 'Centro', '17600-300', -21.9400, -50.5100, 'Rua Iporãs', '540', 'Sala 2')
) AS e(email, cidade_nome, bairro, cep, latitude, longitude, logradouro, numero, complemento)
INNER JOIN usuarios u ON u.email = e.email
INNER JOIN cidades c ON c.nome = e.cidade_nome
WHERE NOT EXISTS (
    SELECT 1 FROM enderecos ed WHERE ed.usuario_id = u.id AND ed.principal = TRUE
);

INSERT INTO telefones (usuario_id, numero, principal, tipo)
SELECT u.id, t.numero, TRUE, 'WHATSAPP'
FROM (VALUES
    ('admin@conecta.com', '(14) 99876-0001'),
    ('matheus@conecta.com', '(14) 99876-1002'),
    ('mariana@conecta.com', '(14) 99876-1003'),
    ('fernanda@conecta.com', '(14) 99876-1004'),
    ('carlos@conecta.com', '(14) 99876-2001'),
    ('roberto@conecta.com', '(14) 99876-2002'),
    ('lucas@conecta.com', '(14) 99876-2003'),
    ('juliana@conecta.com', '(14) 99876-2004'),
    ('marcelo@conecta.com', '(14) 99876-2005')
) AS t(email, numero)
INNER JOIN usuarios u ON u.email = t.email
WHERE NOT EXISTS (
    SELECT 1 FROM telefones tf WHERE tf.usuario_id = u.id AND tf.numero = t.numero
);

-- ----------------------------------------------------------------------------
-- 8. VINCULAR PRESTADORES ÀS CATEGORIAS (Vitrine / Filtros de Busca)
-- ----------------------------------------------------------------------------
INSERT INTO prestador_categorias (prestador_id, categoria_id)
SELECT u.id, c.id
FROM (VALUES
    ('carlos@conecta.com', 'eletrica'),
    ('roberto@conecta.com', 'hidraulica'),
    ('lucas@conecta.com', 'pintura'),
    ('juliana@conecta.com', 'reformas'),
    ('juliana@conecta.com', 'gesso'),
    ('marcelo@conecta.com', 'limpeza')
) AS pc(email, slug)
INNER JOIN usuarios u ON u.email = pc.email
INNER JOIN categorias c ON c.slug = pc.slug
ON CONFLICT (prestador_id, categoria_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 9. PORTFÓLIOS E IMAGENS DOS PRESTADORES (Vitrine de Trabalhos Realizados)
-- ----------------------------------------------------------------------------
DELETE FROM portfolios WHERE prestador_id IN (
    SELECT id FROM usuarios WHERE email IN ('carlos@conecta.com', 'roberto@conecta.com', 'lucas@conecta.com', 'juliana@conecta.com', 'marcelo@conecta.com')
);

INSERT INTO portfolios (prestador_id, titulo, descricao, destaque, total_visualizacoes)
SELECT u.id, p.titulo, p.descricao, p.destaque, p.visualizacoes
FROM (VALUES
    ('carlos@conecta.com', 'Quadro de Disjuntores e Norma NBR-5410', 'Reestruturação completa com barramento bifásico e proteção DR individual.', TRUE, 142),
    ('carlos@conecta.com', 'Iluminação Pendente e Sancas em LED', 'Instalação de trilhos eletrificados e pendentes modernos em sala de jantar.', FALSE, 89),
    ('roberto@conecta.com', 'Instalação de Sistema Pressurizador e Redes PPR', 'Solução para baixa pressão de água quente com tubulações termofundidas.', TRUE, 115),
    ('lucas@conecta.com', 'Efeito Cimento Queimado e Pintura Acrílica Lavável', 'Pintura total de apartamento contemporâneo com fino acabamento fosco.', TRUE, 97),
    ('juliana@conecta.com', 'Reforma Completa de Fachada e Parede de Tijolo Aparente', 'Execução estrutural com alvenaria de alto padrão e impermeabilização.', TRUE, 210),
    ('marcelo@conecta.com', 'Limpeza Técnica Pós-Reforma Residencial', 'Limpeza pesada de porcelanatos e esquadrias de alumínio sem abrasão.', TRUE, 64)
) AS p(email, titulo, descricao, destaque, visualizacoes)
INNER JOIN usuarios u ON u.email = p.email
WHERE NOT EXISTS (
    SELECT 1 FROM portfolios pf WHERE pf.prestador_id = u.id AND pf.titulo = p.titulo
);

INSERT INTO portfolio_imagens (portfolio_id, imagem_url, ordem)
SELECT pf.id, pi.imagem_url, pi.ordem
FROM (VALUES
    ('Quadro de Disjuntores e Norma NBR-5410', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80', 1),
    ('Iluminação Pendente e Sancas em LED', 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=800&q=80', 1),
    ('Instalação de Sistema Pressurizador e Redes PPR', 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=80', 1),
    ('Efeito Cimento Queimado e Pintura Acrílica Lavável', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80', 1),
    ('Reforma Completa de Fachada e Parede de Tijolo Aparente', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80', 1),
    ('Limpeza Técnica Pós-Reforma Residencial', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80', 1)
) AS pi(portfolio_titulo, imagem_url, ordem)
INNER JOIN portfolios pf ON pf.titulo = pi.portfolio_titulo
WHERE NOT EXISTS (
    SELECT 1 FROM portfolio_imagens pfi WHERE pfi.portfolio_id = pf.id AND pfi.imagem_url = pi.imagem_url
);

-- ----------------------------------------------------------------------------
-- 10. DOCUMENTOS DE VERIFICAÇÃO DOS PRESTADORES (Selo de Profissional Verificado)
-- ----------------------------------------------------------------------------
DELETE FROM documentos_prestador WHERE prestador_id IN (
    SELECT id FROM usuarios WHERE email IN ('carlos@conecta.com', 'roberto@conecta.com', 'lucas@conecta.com', 'juliana@conecta.com', 'marcelo@conecta.com')
);

INSERT INTO documentos_prestador (prestador_id, tipo_documento, arquivo_url, status, submetido_em, analisado_em, analisado_por)
SELECT 
    u.id, 
    doc.tipo, 
    doc.url, 
    'APROVADO'::status_documento, 
    CURRENT_TIMESTAMP - INTERVAL '15 days', 
    CURRENT_TIMESTAMP - INTERVAL '14 days', 
    adm.id
FROM (VALUES
    ('carlos@conecta.com', 'CERTIFICADO_NR10', 'https://conecta-docs.s3.amazonaws.com/certificados/carlos-nr10.pdf'),
    ('carlos@conecta.com', 'CNH_PROFISSIONAL', 'https://conecta-docs.s3.amazonaws.com/cnh/carlos-cnh.pdf'),
    ('roberto@conecta.com', 'COMPROVANTE_RESIDENCIA', 'https://conecta-docs.s3.amazonaws.com/docs/roberto-comp.pdf'),
    ('juliana@conecta.com', 'REGISTRO_CREA_CFT', 'https://conecta-docs.s3.amazonaws.com/docs/juliana-cft.pdf'),
    ('lucas@conecta.com', 'CERTIFICADO_TECNICO', 'https://conecta-docs.s3.amazonaws.com/docs/lucas-cert.pdf')
) AS doc(email, tipo, url)
INNER JOIN usuarios u ON u.email = doc.email
CROSS JOIN usuarios adm
WHERE adm.email = 'admin@conecta.com'
AND NOT EXISTS (
    SELECT 1 FROM documentos_prestador dp WHERE dp.prestador_id = u.id AND dp.tipo_documento = doc.tipo
);

-- ----------------------------------------------------------------------------
-- 11. SOLICITAÇÕES DE ORÇAMENTO (Para Cliente, Prestador PRO e Pedidos)
-- ----------------------------------------------------------------------------
DELETE FROM denuncias WHERE usuario_denunciante_id IN (SELECT id FROM usuarios WHERE email = 'mariana@conecta.com');
DELETE FROM conversas WHERE cliente_id IN (SELECT id FROM usuarios WHERE email IN ('matheus@conecta.com', 'mariana@conecta.com', 'fernanda@conecta.com'));
DELETE FROM avaliacoes WHERE cliente_id IN (SELECT id FROM usuarios WHERE email IN ('matheus@conecta.com', 'mariana@conecta.com', 'fernanda@conecta.com'));
DELETE FROM pedidos WHERE cliente_id IN (SELECT id FROM usuarios WHERE email IN ('matheus@conecta.com', 'mariana@conecta.com', 'fernanda@conecta.com'));
DELETE FROM solicitacoes WHERE cliente_id IN (SELECT id FROM usuarios WHERE email IN ('matheus@conecta.com', 'mariana@conecta.com', 'fernanda@conecta.com'));

INSERT INTO solicitacoes (
    cliente_id, prestador_id, categoria_id, endereco_atendimento, 
    titulo, descricao, status, latitude, longitude, criado_em, atualizado_em
)
SELECT 
    cli.id, 
    prest.id, 
    cat.id, 
    s.endereco, 
    s.titulo, 
    s.descricao, 
    s.status::status_solicitacao, 
    s.lat, 
    s.lng, 
    CURRENT_TIMESTAMP - (s.dias_atras || ' days')::INTERVAL,
    CURRENT_TIMESTAMP - (s.dias_atras || ' days')::INTERVAL
FROM (VALUES
    (
        'matheus@conecta.com', 'carlos@conecta.com', 'eletrica',
        'Rua Aimorés, 452, Apto 101 - Centro, Tupã - SP',
        'Troca completa do quadro de luz e revisão do chuveiro',
        'Preciso substituir disjuntores antigos que estão desarmando constantemente ao ligar o chuveiro elétrico de 7500W e o ar-condicionado. Gostaria de revisão de fiação.',
        'ACEITA', -21.9320, -50.5100, 5
    ),
    (
        'mariana@conecta.com', 'roberto@conecta.com', 'hidraulica',
        'Av. das Esmeraldas, 850 - Jardim Esplanada, Marília - SP',
        'Localização e reparo de vazamento oculto no banheiro social',
        'A conta de água aumentou significativamente e há um ponto de umidade na parede divisória do banheiro. Necessito de teste com equipamento geofone.',
        'ACEITA', -22.2150, -49.9400, 10
    ),
    (
        'fernanda@conecta.com', 'lucas@conecta.com', 'pintura',
        'Rua Gustavo Maciel, 15-40 - Altos da Cidade, Bauru - SP',
        'Pintura interna completa de apartamento (70m²)',
        'Apartamento vazio precisando de pintura em paredes e tetos na cor branco neve fosco (Suvinil/Coral). Inclui pequenos reparos em massa corrida.',
        'ABERTA', -22.3200, -49.0600, 1
    ),
    (
        'matheus@conecta.com', 'juliana@conecta.com', 'reformas',
        'Rua Aimorés, 452 - Centro, Tupã - SP',
        'Construção de muro divisório e contrapiso na garagem',
        'Construção de 15 metros lineares de muro com blocos estruturais e concretagem de contrapiso para posterior assentamento cerâmico.',
        'ACEITA', -21.9320, -50.5100, 2
    )
) AS s(cliente_email, prestador_email, categoria_slug, endereco, titulo, descricao, status, lat, lng, dias_atras)
INNER JOIN usuarios cli ON cli.email = s.cliente_email
INNER JOIN usuarios prest ON prest.email = s.prestador_email
LEFT JOIN categorias cat ON cat.slug = s.categoria_slug
WHERE NOT EXISTS (
    SELECT 1 FROM solicitacoes sol WHERE sol.cliente_id = cli.id AND sol.prestador_id = prest.id AND sol.titulo = s.titulo
);

-- ----------------------------------------------------------------------------
-- 12. PROPOSTAS ORÇAMENTÁRIAS
-- ----------------------------------------------------------------------------
INSERT INTO propostas (solicitacao_id, prestador_id, valor_total, prazo_dias, descricao, status, criado_em)
SELECT 
    sol.id, 
    sol.prestador_id, 
    prop.valor, 
    prop.prazo, 
    prop.descricao, 
    prop.status::status_proposta, 
    sol.criado_em + INTERVAL '2 hours'
FROM (VALUES
    ('Troca completa do quadro de luz e revisão do chuveiro', 450.00, 1, 'Inclusa mão de obra para troca de barramento, 6 disjuntores DIN e teste de carga.', 'ACEITA'),
    ('Localização e reparo de vazamento oculto no banheiro social', 280.00, 1, 'Inspeção não destrutiva, conserto de luva de correr e troca de vedante.', 'ACEITA'),
    ('Pintura interna completa de apartamento (70m²)', 1800.00, 4, 'Aplicação de fundo preparador, 2 demãos de tinta acrílica lavável e lixamento técnico.', 'ENVIADA'),
    ('Construção de muro divisório e contrapiso na garagem', 2400.00, 6, 'Alvenaria com amarração de ferro, pilares de sustentação e contrapiso sarrafeado.', 'ACEITA')
) AS prop(solicitacao_titulo, valor, prazo, descricao, status)
INNER JOIN solicitacoes sol ON sol.titulo = prop.solicitacao_titulo
WHERE NOT EXISTS (
    SELECT 1 FROM propostas pr WHERE pr.solicitacao_id = sol.id AND pr.prestador_id = sol.prestador_id
);

INSERT INTO proposta_itens (proposta_id, descricao, valor, quantidade)
SELECT pr.id, item.descricao, item.valor, item.quantidade
FROM (VALUES
    ('Troca completa do quadro de luz e revisão do chuveiro', 'Mão de obra técnica de substituição do quadro e cabeamento', 350.00, 1),
    ('Troca completa do quadro de luz e revisão do chuveiro', 'Disjuntor bipolar DR 40A + barramento pente', 100.00, 1),
    ('Localização e reparo de vazamento oculto no banheiro social', 'Diagnóstico eletrônico de vazamento e abertura pontual', 180.00, 1),
    ('Localização e reparo de vazamento oculto no banheiro social', 'Mão de obra de reparo hidráulico e fechamento com argamassa', 100.00, 1)
) AS item(solicitacao_titulo, descricao, valor, quantidade)
INNER JOIN solicitacoes sol ON sol.titulo = item.solicitacao_titulo
INNER JOIN propostas pr ON pr.solicitacao_id = sol.id
WHERE NOT EXISTS (
    SELECT 1 FROM proposta_itens pri WHERE pri.proposta_id = pr.id AND pri.descricao = item.descricao
);

-- ----------------------------------------------------------------------------
-- 13. PEDIDOS DE SERVIÇO (Demonstração do Fluxo Real em Meus Pedidos e PRO)
-- ----------------------------------------------------------------------------
INSERT INTO pedidos (
    cliente_id, prestador_id, descricao_necessidade, status, valor_combinado, 
    valor_final, proposta_id, endereco_atendimento, agendado_para, 
    data_solicitacao, iniciado_em, concluido_em, data_conclusao
)
SELECT 
    sol.cliente_id, 
    sol.prestador_id, 
    sol.titulo, 
    ped.status::status_pedido, 
    pr.valor_total, 
    pr.valor_total, 
    pr.id, 
    sol.endereco_atendimento, 
    CURRENT_TIMESTAMP - (ped.dias_concluido || ' days')::INTERVAL, 
    sol.criado_em, 
    CURRENT_TIMESTAMP - (ped.dias_concluido || ' days')::INTERVAL, 
    CASE WHEN ped.status = 'CONCLUIDO'::status_pedido THEN CURRENT_TIMESTAMP - (ped.dias_concluido || ' days')::INTERVAL + INTERVAL '5 hours' ELSE NULL END,
    CASE WHEN ped.status = 'CONCLUIDO'::status_pedido THEN CURRENT_TIMESTAMP - (ped.dias_concluido || ' days')::INTERVAL + INTERVAL '5 hours' ELSE NULL END
FROM (VALUES
    ('Troca completa do quadro de luz e revisão do chuveiro', 'CONCLUIDO'::status_pedido, 4),
    ('Localização e reparo de vazamento oculto no banheiro social', 'CONCLUIDO'::status_pedido, 8),
    ('Construção de muro divisório e contrapiso na garagem', 'AGENDADO'::status_pedido, 0)
) AS ped(solicitacao_titulo, status, dias_concluido)
INNER JOIN solicitacoes sol ON sol.titulo = ped.solicitacao_titulo
INNER JOIN propostas pr ON pr.solicitacao_id = sol.id
WHERE NOT EXISTS (
    SELECT 1 FROM pedidos pd WHERE pd.cliente_id = sol.cliente_id AND pd.prestador_id = sol.prestador_id AND pd.descricao_necessidade = sol.titulo
);

-- ----------------------------------------------------------------------------
-- 14. AVALIAÇÕES REAIS (Disparam Trigger de Média de Avaliação do Prestador)
-- ----------------------------------------------------------------------------
INSERT INTO avaliacoes (pedido_id, cliente_id, prestador_id, nota, comentario, data_criacao)
SELECT 
    pd.id, 
    pd.cliente_id, 
    pd.prestador_id, 
    av.nota, 
    av.comentario, 
    pd.concluido_em + INTERVAL '1 hour'
FROM (VALUES
    (
        'Troca completa do quadro de luz e revisão do chuveiro', 
        5, 
        'Serviço impecável! O Carlos trocou toda a fiação antiga do quadro com muito cuidado, identificou o curto no chuveiro rapidamente e deixou tudo etiquetado. Super educado e pontual!'
    ),
    (
        'Localização e reparo de vazamento oculto no banheiro social', 
        5, 
        'Excelente profissional! Identificou o ponto exato do vazamento através do equipamento sem precisar quebrar a parede inteira. Preço justo, serviço limpo e garantia cumprida.'
    )
) AS av(pedido_titulo, nota, comentario)
INNER JOIN pedidos pd ON pd.descricao_necessidade = av.pedido_titulo
ON CONFLICT (pedido_id) DO UPDATE
SET nota = EXCLUDED.nota, comentario = EXCLUDED.comentario;

-- ----------------------------------------------------------------------------
-- 15. CONVERSAS E MENSAGENS NO CHAT (Para o Messenger e Chat de Pedidos)
-- ----------------------------------------------------------------------------
INSERT INTO conversas (pedido_id, cliente_id, prestador_id, criado_em, atualizado_em)
SELECT 
    pd.id, 
    pd.cliente_id, 
    pd.prestador_id, 
    pd.data_solicitacao, 
    CURRENT_TIMESTAMP
FROM pedidos pd
WHERE NOT EXISTS (
    SELECT 1 FROM conversas c WHERE c.cliente_id = pd.cliente_id AND c.prestador_id = pd.prestador_id
);

-- Conversas sem pedido fechado (negociação em aberto)
INSERT INTO conversas (pedido_id, cliente_id, prestador_id, criado_em, atualizado_em)
SELECT 
    NULL, 
    cli.id, 
    prest.id, 
    CURRENT_TIMESTAMP - INTERVAL '1 day', 
    CURRENT_TIMESTAMP
FROM usuarios cli
CROSS JOIN usuarios prest
WHERE cli.email = 'fernanda@conecta.com' AND prest.email = 'lucas@conecta.com'
AND NOT EXISTS (
    SELECT 1 FROM conversas c WHERE c.cliente_id = cli.id AND c.prestador_id = prest.id
);

-- Mensagens na conversa Matheus x Carlos (Eletricista)
INSERT INTO mensagens (conversa_id, remetente_id, tipo, conteudo, lida, lida_em, enviado_em)
SELECT 
    c.id, 
    cli.id, 
    'TEXTO'::tipo_mensagem, 
    'Olá Carlos! Tudo bem? Vi que você é especialista em quadros elétricos na região de Tupã. O disjuntor aqui desarmou de vez.', 
    TRUE, 
    c.criado_em + INTERVAL '10 minutes', 
    c.criado_em + INTERVAL '5 minutes'
FROM conversas c
INNER JOIN usuarios cli ON cli.email = 'matheus@conecta.com'
INNER JOIN usuarios prest ON prest.email = 'carlos@conecta.com'
WHERE c.cliente_id = cli.id AND c.prestador_id = prest.id
AND NOT EXISTS (
    SELECT 1 FROM mensagens m WHERE m.conversa_id = c.id AND m.remetente_id = cli.id
);

INSERT INTO mensagens (conversa_id, remetente_id, tipo, conteudo, lida, lida_em, enviado_em)
SELECT 
    c.id, 
    prest.id, 
    'TEXTO'::tipo_mensagem, 
    'Olá Matheus! Perfeito. Consigo passar aí hoje às 14h para avaliar a carga do circuito e já levo as ferramentas e disjuntores DIN.', 
    TRUE, 
    c.criado_em + INTERVAL '25 minutes', 
    c.criado_em + INTERVAL '20 minutes'
FROM conversas c
INNER JOIN usuarios cli ON cli.email = 'matheus@conecta.com'
INNER JOIN usuarios prest ON prest.email = 'carlos@conecta.com'
WHERE c.cliente_id = cli.id AND c.prestador_id = prest.id
AND NOT EXISTS (
    SELECT 1 FROM mensagens m WHERE m.conversa_id = c.id AND m.remetente_id = prest.id
);

-- ----------------------------------------------------------------------------
-- 16. DENÚNCIA DE EXEMPLO (Para alimentar a Moderacão e Métricas do Admin)
-- ----------------------------------------------------------------------------
INSERT INTO denuncias (
    usuario_denunciante_id, usuario_denunciado_id, tipo_denuncia, motivo, 
    descricao, status, criado_em
)
SELECT 
    u1.id, 
    u2.id, 
    'COBRANCA_INDEVIDA'::tipo_denuncia, 
    'Tentativa de cobrança de taxa de deslocamento fora da plataforma', 
    'O prestador solicitou um pagamento adicional via PIX direto antes da visita técnica, em desacordo com os termos de contratação.', 
    'ABERTA'::status_denuncia, 
    CURRENT_TIMESTAMP - INTERVAL '3 days'
FROM usuarios u1
CROSS JOIN usuarios u2
WHERE u1.email = 'mariana@conecta.com' AND u2.email = 'marcelo@conecta.com'
AND NOT EXISTS (
    SELECT 1 FROM denuncias d WHERE d.usuario_denunciante_id = u1.id AND d.usuario_denunciado_id = u2.id
);

COMMIT;

-- ============================================================================
-- FIM DO SCRIPT DE SEED
-- ============================================================================
