# Conecta - System Design Document

## Projeto Integrador - Sistema de Conexão local para Prestadores de Serviços

## 1. Visão Geral do Produto

O **Conecta** é uma plataforma marketplace mobile-first (Web Responsiva) focada na prestação de serviços locais (fase inicial focada na construção civil e manutenções residenciais). O sistema atua como uma ponte digital entre **Clientes** (que precisam de serviços rápidos e confiáveis) e **Prestadores** (profissionais buscando visibilidade e orçamentos).

O diferencial da plataforma é o seu motor de **Geolocalização**, priorizando profissionais geograficamente próximos ao cliente, e um sistema de **Avaliações**, onde apenas serviços efetivamente concluídos pela plataforma geram notas.

## 2. Arquitetura e Stack Tecnológico

**Frontend:** React (JS/TS) + Tailwind CSS

**Padrão:** Interface Mobile-First, Web Responsiva (PWA).

**Integração:** Consumo de API RESTful via Axios/Fetch.

**Backend:** .NET (C#) - Web API

**Arquitetura:** Monólito Modular (Clean Architecture).

**Segurança:** Autenticação via JWT (JSON Web Token) com RBAC (Role-Based Access Control) através de Claims (Cliente vs Prestador).

**ORM:** Entity Framework Core.

**Banco de Dados:** PostgreSQL

**Hospedagem (Futura):** Nuvem (AWS RDS, Supabase ou ElephantSQL).

**Integrações Externas (3rd Party):**

API do ViaCEP para preenchimento automático de endereços e estados.

**Infraestrutura/DevOps:** Docker (Conteinerização da API e BD para ambiente de desenvolvimento local unificado).

## 3. Regras de Negócio e Funcionalidades Principais (MVP)

### Busca local (Geolocalização):

O Front-end captura as coordenadas do cliente (GPS do dispositivo).

O Backend (.NET) realiza o cálculo de distância utilizando Latitude e Longitude dos prestadores cadastrados para retornar os resultados ordenados por proximidade.

### Fluxo de Transação (Pedidos):

O cliente não avalia livremente. Ele deve gerar um Pedido (Solicitação de Orçamento) -> O Prestador Aceita/Recusa -> O Serviço é Concluído.

### Sistema de Reputação:

A tabela de avaliações exige obrigatoriamente o pedido_id. Notas só são dadas após a conclusão do fluxo transacional.

### Vitrine do Prestador (Portfólio):

Página pública com foto de capa, avatar, biografia, status de disponibilidade (Online/Ocupado) e galeria de fotos de trabalhos anteriores.

## 5. Padrões da Equipe (Workflow)

Para garantir um desenvolvimento ágil e sem conflitos durante o Projeto Integrador, todos os desenvolvedores devem seguir estas regras:

### Branching Strategy (Git Flow Simplificado):

**main:** Produção. Código sempre estável e testado.

**develop:** Branch de integração. Todo desenvolvimento nasce e morre aqui.

**Branches de tarefa:** feature/nome-da-feature ou fix/nome-do-bug.

### Commits:

Siga o padrão Conventional Commits (Ex: feat: adiciona tabela de pedidos, fix: corrige margin).

### Código Limpo (Clean Code):

**Backend:** Nome de variáveis em português, padrão PascalCase para Classes/Interfaces e camelCase para variáveis em C#.

**Frontend:** Componentização no React. Evitar componentes gigantes; quebre em arquivos menores dentro da pasta components.
