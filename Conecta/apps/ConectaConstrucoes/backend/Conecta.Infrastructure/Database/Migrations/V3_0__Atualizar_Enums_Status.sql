-- ==============================================================================
-- Migração V3_0: Atualização dos Enums de Status (Evolve)
-- Adiciona valores de status utilizados pela aplicação nos fluxos de conclusão
-- ==============================================================================

-- Adiciona o valor 'CONCLUIDA' ao enum status_solicitacao para alinhamento com a conclusão de serviços
ALTER TYPE status_solicitacao ADD VALUE IF NOT EXISTS 'CONCLUIDA';
