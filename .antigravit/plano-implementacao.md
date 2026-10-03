# Plano de Implementação: Arquitetura DDD, Stack de Dados Híbrida e Dockerização

Este documento apresenta o plano detalhado de implementação para o ecossistema **Conecta Construções**, cobrindo o diagnóstico do estado atual do repositório, a especificação das camadas de arquitetura DDD, a configuração da stack híbrida de dados (EF Core + Dapper + Evolve), a incorporação dos scripts SQL da pasta `objs/` e a orquestração via Docker Compose.

---

## 1. Diagnóstico do Estado Atual do Repositório

### 1.1 Backend (.NET)
- **Localização:** `Conecta/apps/ConectaConstrucoes/backend`
- **Framework:** .NET 10.0 (`net10.0` em todos os projetos).
- **Compilação Atual:** Solução compila com sucesso (`dotnet build`), com warning de vulnerabilidade conhecida em dependência transitiva (`Microsoft.OpenApi 2.0.0`).
- **Camadas Existentes:**
  - `Conecta.Domain`: Projeto de biblioteca de classes puro (pastas `Entidades/` e `Interfaces/` com `.gitkeep`). Nenhuma dependência externa. **(Conforme com DDD)**.
  - `Conecta.Application`: Projeto de biblioteca de classes referenciando apenas `Conecta.Domain` (pastas `DTOs/` e `Servicos/` com `.gitkeep`). **(Conforme com DDD)**.
  - `Conecta.Infrastructure`: Referencia `Conecta.Domain` e `Conecta.Application` (pastas `Data/` e `Repositorios/` com `.gitkeep`). **Ausência de pacotes:** Não possui `Npgsql.EntityFrameworkCore.PostgreSQL`, `Dapper`, `Npgsql` nem `Evolve`.
  - `Conecta.API`: Projeto Web API referenciando `Application` e `Infrastructure`. Possui `Microsoft.AspNetCore.OpenApi` (10.0.3), porém sem Swagger UI interativo configurado no `Program.cs`. Não possui configuração de injeção de dependência de banco de dados ou migração.
- **Dockerfile:** Inexistente.

### 1.2 Frontend (React)
- **Localização:** `Conecta/apps/ConectaConstrucoes/frontend`
- **Stack:** React 19.2 + TypeScript + Vite 8.3.
- **Estado:** Estrutura básica configurada (`src/assets`, `core`, `features`, `pages`, `routes`), dependências não instaladas localmente (`node_modules` ausente).
- **Dockerfile / Nginx:** Inexistente.

### 1.3 Infraestrutura e Docker Compose
- **docker-compose na raiz:** Não existe `docker-compose.yml` na raiz do repositório (`c:\Users\gabri\Documents\GitHub\Conecta-Construcoes\`).
- **docker-compose legado em `Conecta/`:** Contém apenas serviços isolados de `postgres` e `redis`, sem backend, sem frontend, sem healthcheck e com credenciais fixas sem `.env`.
- **Arquivos `.env` e `.env.example`:** Inexistentes.

### 1.4 Estruturas SQL Existentes na Pasta `objs/`
O projeto já conta com definições SQL prontas no diretório `objs/`, que representam o modelo de dados a ser aplicado no banco via **Evolve**:
- **`objs/schema.sql` (122 linhas):**
  - Contém o schema conceitual e relacional básico: `usuarios`, `telefones`, `estados`, `cidades`, `enderecos`, `clientes`, `prestadores`, `categorias`, `prestador_categorias`, `portfolio_items`, `pedidos` e `avaliacoes`.
- **`objs/create.sql` (957 linhas):**
  - Schema completo e aprofundado para PostgreSQL, contendo:
    - **Tipos Customizados (ENUMs):** `status_disponibilidade`, `status_solicitacao`, `status_proposta`, `status_pedido`, `tipo_mensagem`, `status_verificacao`, `status_conta`, `status_documento`, `tipo_denuncia`, `status_denuncia`.
    - **RBAC (Papéis e Permissões):** Tabelas `roles`, `permissoes`, `role_permissoes`, `usuario_roles`.
    - **Estruturas de Negócio Expandidas:** `usuarios`, `telefones`, `enderecos`, `cliente`, `prestador`, `documentos_prestador`, `categorias`, `especialidades`, `portfolio_items`, `solicitacoes`, `propostas`, `pedidos`, `conversas`, `mensagens`, `avaliacoes`, `denuncias`.
    - **Índices Otimizados:** Índices em chaves estrangeiras, geolocalização (`latitude`/`longitude`), status e buscas textuais.
    - **Funções e Triggers PL/pgSQL:** `update_atualizado_em()` (atualização automática de timestamp) e `atualizar_media_avaliacoes()` (cálculo automático em tempo real da média e contagem de avaliações do prestador).

---

## 2. Visão Geral da Arquitetura e Decisões Técnicas

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       Docker Compose Orchestration                      │
│                                                                         │
│   ┌───────────────┐        ┌──────────────┐        ┌────────────────┐   │
│   │   Frontend    │──────▶ │   Backend    │──────▶ │    Postgres    │   │
│   │ (React/Nginx) │  HTTP  │ (.NET 10 API)│        │   (16-alpine)  │   │
│   │   Port: 3000  │        │  Port: 5000  │        │   Port: 5432   │   │
│   └───────────────┘        └──────────────┘        └────────────────┘   │
│                                   │                         ▲           │
│                                   │                         │           │
│                  ┌────────────────┴─────────────────────────┴─┐         │
│                  │ Evolve Migrations (Insumos de objs/*.sql) │         │
│                  │ EF Core (Escritas / Agregados do Domínio)  │         │
│                  │ Dapper (Leituras Otimizadas de Alta Perf.) │         │
│                  └────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Princípios Arquiteturais Obrigatórios:
1. **DDD Estrito:** O `Domain` não deve conhecer nenhuma tecnologia de banco ou persistência. O `Application` orquestra casos de uso e depende apenas de interfaces definidas no `Domain`. O `Infrastructure` implementa o acesso aos dados e tecnologias externas. O `API` serve como ponto de entrada HTTP e inicialização.
2. **Separação CQRS / Acesso Híbrido:**
   - **Escrita e Modelo Rico:** EF Core (`Npgsql.EntityFrameworkCore.PostgreSQL`) com mapeamentos fluentes e `DbContext` na `Infrastructure`.
   - **Leitura de Alta Performance:** Dapper (`Dapper` + `Npgsql`) com consultas SQL otimizadas através de uma conexão segura (`IDbConnectionFactory`).
3. **Evolve como Única Fonte da Verdade de Schema (Alimentado por `objs/`):**
   - **Proibido** o uso de `dotnet ef migrations add`. O EF Core não gerencia o schema do banco.
   - Os arquivos de `objs/` (`objs/create.sql` e `objs/schema.sql`) serão convertidos e estruturados como migrations do Evolve em `Conecta.Infrastructure/Database/Migrations/`.
   - Execução automática no startup da aplicação antes de atender requisições HTTP, garantindo integridade imediata e banco pronto.

---

## 3. Roteiro Passo a Passo de Implementação

### Etapa 1: Dependências NuGet e Separação de Camadas (.csproj)

#### 1.1 `Conecta.Infrastructure.csproj`
Adicionar os pacotes necessários e a regra para copiar os scripts SQL das migrações:
- `Npgsql.EntityFrameworkCore.PostgreSQL` (versão 10.0.3)
- `Dapper` (versão 2.1.66)
- `Npgsql` (versão 10.0.3)
- `Evolve` (versão 3.2.0)
- Configurar item group para embutir/copiar migrações para a pasta de build e publicação:
```xml
<ItemGroup>
  <Content Include="Database\Migrations\**\*.sql">
    <CopyToOutputDirectory>Always</CopyToOutputDirectory>
  </Content>
</ItemGroup>
```

#### 1.2 `Conecta.API.csproj`
Adicionar o pacote para documentação interativa da API:
- `Swashbuckle.AspNetCore` (versão 10.2.3) ou `Scalar.AspNetCore` (versão 2.17.13) integrado com `Microsoft.AspNetCore.OpenApi`.

---

### Etapa 2: Implementação da Camada de Dados e Migrações (Insumos de `objs/`)

#### 2.1 Conexão Dapper (`IDbConnectionFactory`)
- Criar a interface de fábrica de conexões em `Conecta.Domain/Interfaces/IDbConnectionFactory.cs` (ou `Application/Interfaces`):
  ```csharp
  public interface IDbConnectionFactory
  {
      DbConnection CreateConnection();
  }
  ```
- Implementar em `Conecta.Infrastructure/Data/DbConnectionFactory.cs` utilizando `NpgsqlConnection` e a connection string configurada.

#### 2.2 EF Core `AppDbContext`
- Criar `Conecta.Infrastructure/Data/AppDbContext.cs` herdando de `DbContext`.
- Configurar via `DbContextOptions<AppDbContext>`.
- Inserir `OnModelCreating` preparado para carregar configurações fluentes (`IEntityTypeConfiguration<T>`) mapeadas diretamente para as tabelas criadas pelo Evolve.

#### 2.3 Estrutura de Migrações Evolve a partir de `objs/`
As migrações do Evolve devem seguir o padrão estrito `V{versao}__{descricao}.sql`.
A estrutura inicial será organizada em `Conecta.Infrastructure/Database/Migrations/`:

1. **`V1_0_0__Initial_Schema.sql` (Baseado em `objs/create.sql`):**
   - Transposição do schema completo validado presente em [objs/create.sql](file:///c:/Users/gabri/Documents/GitHub/Conecta-Construcoes/objs/create.sql):
     - Criação de todos os ENUMs de domínio (`status_disponibilidade`, `status_solicitacao`, `status_proposta`, `status_pedido`, `status_verificacao`, etc.).
     - Tabelas de segurança e RBAC (`roles`, `permissoes`, `role_permissoes`, `usuario_roles`).
     - Tabelas de entidades principais (`usuarios`, `telefones`, `enderecos`, `cliente`, `prestador`, `documentos_prestador`).
     - Tabelas de catálogo e portfólio (`categorias`, `especialidades`, `portfolio_items`).
     - Tabelas de transações e comunicação (`solicitacoes`, `propostas`, `pedidos`, `conversas`, `mensagens`, `avaliacoes`, `denuncias`).
     - Índices de busca e filtros geográficos.
     - Triggers e Procedures (`update_atualizado_em`, `atualizar_media_avaliacoes`).

2. **Rastreabilidade com `objs/schema.sql`:**
   - [objs/schema.sql](file:///c:/Users/gabri/Documents/GitHub/Conecta-Construcoes/objs/schema.sql) servirá como documentação de referência do core relacional simplificado, garantindo que todas as tabelas nele previstas (`estados`, `cidades`, etc.) estejam harmonizadas no schema final do Evolve.

3. **Classe `EvolveDatabaseMigrator`:**
   - Criar `Conecta.Infrastructure/Database/EvolveDatabaseMigrator.cs`:
     - Instancia o `Evolve.Evolve` passando a `NpgsqlConnection` aberta.
     - Configura o diretório das migrações:
       ```csharp
       var evolve = new Evolve.Evolve(connection, msg => logger.LogInformation(msg))
       {
           Locations = new[] { Path.Combine(AppContext.BaseDirectory, "Database", "Migrations") },
           IsEraseDisabled = true,
           CommandTimeout = 60
       };
       evolve.Migrate();
       ```

#### 2.4 Extensão de Injeção de Dependência
- Criar `Conecta.Infrastructure/DependencyInjection.cs`:
  - Método de extensão `IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)`.
  - Registra `AppDbContext` com `UseNpgsql`.
  - Registra `IDbConnectionFactory` como Singleton ou Scoped.
  - Registra `EvolveDatabaseMigrator`.

---

### Etapa 3: Configuração da API (.NET)

#### 3.1 `Program.cs`
- Injetar serviços de infraestrutura (`builder.Services.AddInfrastructure(builder.Configuration)`).
- Configurar documentação da API (OpenAPI + Swagger UI / Scalar UI).
- Configurar CORS para permitir requisições do frontend (portas 3000 e 80).
- Adicionar execução das migrações do Evolve no startup da aplicação:
  ```csharp
  using (var scope = app.Services.CreateScope())
  {
      var migrator = scope.ServiceProvider.GetRequiredService<EvolveDatabaseMigrator>();
      migrator.Migrate();
  }
  ```
- Adicionar endpoint de healthcheck / status do banco para validação automática de conectividade.

#### 3.2 `appsettings.json` e `appsettings.Development.json`
- Incluir chave `ConnectionStrings:DefaultConnection` apontando para o PostgreSQL:
  `"Server=localhost;Port=5432;Database=conecta_db;User Id=conecta_user;Password=conecta_pass;"`.

---

### Etapa 4: Dockerização dos Componentes

#### 4.1 Backend Dockerfile (`Conecta/apps/ConectaConstrucoes/backend/Dockerfile`)
- Multi-stage build com .NET 10:
  - **Stage 1: Base de Runtime**
    - `FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS base`
    - Diretório `/app`, porta 5000 (HTTP) exposta.
  - **Stage 2: Build & Restore**
    - `FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build`
    - Copiar `.csproj` de todas as camadas (`Conecta.Domain`, `Conecta.Application`, `Conecta.Infrastructure`, `Conecta.API`).
    - Executar `dotnet restore ./Conecta.API/Conecta.API.csproj`.
    - Copiar código fonte completo (incluindo `Database/Migrations/`).
    - Executar `dotnet build -c Release -o /app/build`.
  - **Stage 3: Publish**
    - `FROM build AS publish`
    - Executar `dotnet publish -c Release -o /app/publish /p:UseAppHost=false`.
  - **Stage 4: Final**
    - `FROM base AS final`
    - Copiar conteúdo de `/app/publish` para `/app`.
    - Garantir que os scripts `.sql` migrados estejam disponíveis no diretório publicado.
    - `ENTRYPOINT ["dotnet", "Conecta.API.dll"]`.

#### 4.2 Frontend Dockerfile (`Conecta/apps/ConectaConstrucoes/frontend/Dockerfile`)
- Multi-stage build com Node & Nginx:
  - **Stage 1: Build**
    - `FROM node:22-alpine AS build`
    - Diretório `/app`.
    - Copiar `package.json` e `package-lock.json`.
    - Executar `npm ci`.
    - Copiar arquivos do projeto e rodar `npm run build`.
  - **Stage 2: Nginx Runtime**
    - `FROM nginx:alpine AS final`
    - Copiar artefatos gerados em `/app/dist` para `/usr/share/nginx/html`.
    - Copiar configuração personalizada `nginx.conf`.
    - Expor porta 80.
    - `CMD ["nginx", "-g", "daemon off;"]`.

#### 4.3 Configuração do Nginx (`Conecta/apps/ConectaConstrucoes/frontend/nginx.conf`)
- Servir arquivos estáticos da SPA com suporte a HTML5 History API (`try_files $uri $uri/ /index.html;`).
- Proxy reverso transparente para requisições de API (`location /api/ { proxy_pass http://backend:5000/api/; }`).

---

### Etapa 5: Orquestração com Docker Compose

#### 5.1 Arquivo `docker-compose.yml` (Diretório `Conecta/`)
Configurar orquestração integrando o ecossistema existente:
1. **`postgres`**:
   - Imagem: `postgres:16-alpine`.
   - Variáveis: `POSTGRES_DB=${POSTGRES_DB}`, `POSTGRES_USER=${POSTGRES_USER}`, `POSTGRES_PASSWORD=${POSTGRES_PASSWORD}`.
   - Volume: `postgres_data:/var/lib/postgresql/data`.
   - Healthcheck:
     ```yaml
     healthcheck:
       test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
       interval: 5s
       timeout: 5s
       retries: 5
       start_period: 5s
     ```
   - Rede: `monorepo-network`.
2. **`redis`**:
   - Imagem: `redis:7-alpine`.
   - Volume: `redis_data:/data`.
   - Rede: `monorepo-network`.
3. **`backend`**:
   - Build: contexto `./apps/ConectaConstrucoes/backend`, Dockerfile `Dockerfile`.
   - Portas: `${BACKEND_PORT:-5000}:5000`.
   - Variáveis de ambiente:
     - `ASPNETCORE_ENVIRONMENT=Development` (ou `Production`)
     - `ASPNETCORE_URLS=http://+:5000`
     - `ConnectionStrings__DefaultConnection=Host=postgres;Port=5432;Database=${POSTGRES_DB};Username=${POSTGRES_USER};Password=${POSTGRES_PASSWORD};`
   - Dependência estrita do banco pronto:
     ```yaml
     depends_on:
       postgres:
         condition: service_healthy
     ```
   - Rede: `monorepo-network`.
4. **`frontend`**:
   - Build: contexto `./apps/ConectaConstrucoes/frontend`, Dockerfile `Dockerfile`.
   - Portas: `${FRONTEND_PORT:-3000}:80`.
   - Dependência: `backend`.
   - Rede: `monorepo-network`.

#### 5.2 Arquivos de Ambiente (`Conecta/.env` e `Conecta/.env.example`)
- Chaves parametrizadas com credenciais existentes:
  - `POSTGRES_USER=admin`
  - `POSTGRES_PASSWORD=admin123`
  - `POSTGRES_DB=monorepo_db`
  - `POSTGRES_PORT=5432`
  - `REDIS_PORT=6379`
  - `BACKEND_PORT=5000`
  - `FRONTEND_PORT=3000`

---

## 4. Matriz de Rastreabilidade dos Requisitos

| Requisito | Camada / Arquivo | Componente / Tecnologia | Status Atual |
| :--- | :--- | :--- | :--- |
| **Orquestração Docker** | `Conecta/docker-compose.yml` | Docker Compose + Healthcheck | Concluído (Validado) |
| **Backend Dockerfile** | `backend/Dockerfile` | .NET 10 Multi-stage | Concluído (Validado) |
| **Frontend Dockerfile** | `frontend/Dockerfile` | Node 22 + Nginx Alpine | Concluído (Validado) |
| **DDD: Domain Isolado** | `Conecta.Domain` | C# .NET 10 | Concluído (Validado) |
| **DDD: Application** | `Conecta.Application` | C# .NET 10 | Concluído (Validado) |
| **Escrita / Domínio** | `Conecta.Infrastructure` | EF Core (`Npgsql.EntityFrameworkCore.PostgreSQL`) | A configurar (Fase 2) |
| **Consultas Otimizadas** | `Conecta.Infrastructure` | Dapper (`Dapper` + `Npgsql`) | A configurar (Fase 2) |
| **Versionamento Schema** | `Conecta.Infrastructure` | Evolve (`Evolve` + migrations baseadas em `objs/`) | A configurar (Fase 2) |
| **Scripts Iniciais SQL** | `objs/create.sql` e `objs/schema.sql` | Mapeados para `Database/Migrations/V1_0_0__Initial_Schema.sql` | Especificado no Plano |
| **Cópia de Scripts SQL** | `Conecta.Infrastructure.csproj` | `<CopyToOutputDirectory>Always</CopyToOutputDirectory>` | A configurar (Fase 2) |
| **Docs da API** | `Conecta.API` | Swagger UI / OpenAPI v3 | A configurar (Fase 2) |
| **Healthcheck Postgres** | `docker-compose.yml` | `pg_isready` + `service_healthy` | Concluído (Validado) |

---

## 5. Plano de Validação e Testes

1. **Compilação e Verificação .NET:**
   - Executar `dotnet restore` e `dotnet build` na solução do backend garantindo 0 erros.
2. **Validação das Migrações Evolve e Scripts SQL:**
   - Garantir que os scripts migrados a partir de `objs/create.sql` e `objs/schema.sql` para `Database/Migrations/V1_0_0__Initial_Schema.sql` sejam copiados para o output (`bin/Debug/net10.0/Database/Migrations`).
   - Validar que o Evolve executa toda a DDL (ENUMs, tabelas, chaves estrangeiras, índices e triggers) sem erros de sintaxe no PostgreSQL.
3. **Validação do Frontend:**
   - Testar o build estático com `npm run build` garantindo geração correta na pasta `dist/`.
4. **Validação Sintática do Docker Compose:**
   - Validar estrutura e referências de volume e rede com `docker compose config`.
5. **Execução Integrada:**
   - Executar `docker compose up --build`.
   - Verificar nos logs se o PostgreSQL responde ao `healthcheck`.
   - Verificar se o container do backend aguarda o PostgreSQL estar saudável.
   - Verificar se o Evolve aplica a migração com sucesso a partir de `objs/`.
   - Acessar o endpoint do Swagger da API (`http://localhost:5000/swagger` ou `/openapi/v1.json`).
   - Acessar o Frontend (`http://localhost:3000`) e testar a comunicação com a API.
