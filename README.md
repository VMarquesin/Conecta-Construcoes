# Conecta Construções

Plataforma em desenvolvimento para aproximar clientes e prestadores de serviços locais, com foco inicial em construção civil e manutenção residencial. A proposta completa do produto está descrita em [doc/System_Design.md](doc/System_Design.md).

> **Estado atual:** o repositório reúne a base do monorepo e um painel administrativo navegável que usa dados simulados por padrão. A API Conecta ainda está em fase inicial: o controller funcional presente é o exemplo `WeatherForecast`; os endpoints de negócio consumidos pelo painel ainda não estão implementados.

## Estrutura do repositório

```text
Conecta/
├── apps/
│   ├── ConectaConstrucoes/
│   │   ├── backend/       # API .NET e camadas da aplicação
│   │   └── frontend/      # Aplicação React
│   └── SistemaFuturo/     # Estrutura reservada para desenvolvimento futuro
└── servicos-compartilhados/
    ├── Autenticacao.API/
    └── AuditoriaLog.Service/

doc/
└── System_Design.md       # Visão e regras planejadas para o produto
```

O Docker Compose atual está em [Conecta/docker-compose.yml](Conecta/docker-compose.yml) e sobe a aplicação Conecta Construções, PostgreSQL, Redis e os serviços web. Os projetos em `servicos-compartilhados` não fazem parte desse Compose.

## Tecnologias

- **Frontend:** React 19, TypeScript, React Router, Vite e CSS.
- **Backend:** .NET 10 / ASP.NET Core, organizado em projetos de API, Application, Domain e Infrastructure.
- **Persistência:** PostgreSQL 16; EF Core e Dapper estão configurados na infraestrutura. Scripts SQL versionados são aplicados pelo Evolve.
- **Ambiente conteinerizado:** Docker Compose, Redis 7 e Nginx para servir o frontend.

## O que está disponível

### Painel administrativo

As rotas atuais estão sob `/admin` e incluem:

- visão geral;
- listagem, consulta e edição de usuários;
- gerenciamento de papéis;
- revisão de documentos;
- moderação de denúncias.

Por padrão, essas telas usam um serviço de **mock**. As alterações ficam em memória e não são persistidas no banco. A implementação HTTP do frontend chama rotas administrativas que ainda não existem na API Conecta.

### Backend e modelo de dados

A API configura conexão com PostgreSQL, Swagger/OpenAPI e aplicação de scripts de banco na inicialização. O schema evolui pelos arquivos em [Conecta/apps/ConectaConstrucoes/backend/Conecta.Infrastructure/Database/Migrations](Conecta/apps/ConectaConstrucoes/backend/Conecta.Infrastructure/Database/Migrations). Há também uma rota de exemplo `WeatherForecast`.

### Próximas funcionalidades previstas

O documento de design propõe busca local por geolocalização, perfis e portfólios de prestadores, pedidos e propostas, avaliações vinculadas a serviços concluídos e autenticação com perfis de acesso. Essas capacidades são **planejadas** e não devem ser consideradas fluxos já disponíveis na aplicação.

## Requisitos

Para executar tudo em contêineres:

- Docker Desktop com Docker Compose;
- recursos suficientes para executar PostgreSQL, Redis, API e frontend.

Para desenvolvimento local sem contêineres:

- .NET SDK 10;
- Node.js 22 e npm;
- PostgreSQL acessível localmente (Redis só é necessário se o trabalho exigir esse serviço).

## Executar com Docker Compose

Na raiz do repositório, execute:

```bash
docker compose -f Conecta/docker-compose.yml up --build
```

Ou entre na pasta `Conecta` e execute `docker compose up --build`.

Após a inicialização:

| Serviço | Endereço/porta local |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:5000 |
| Swagger da API | http://localhost:5000/swagger |
| PostgreSQL | `localhost:5432` |
| Redis | `localhost:6379` |

Para encerrar os serviços, use `docker compose -f Conecta/docker-compose.yml down` na raiz. Para apagar também os dados persistidos do banco e do Redis, use `docker compose -f Conecta/docker-compose.yml down -v` — essa ação remove os volumes.

O backend tenta aplicar as migrações Evolve ao iniciar. Se o banco estiver indisponível, a API registra um aviso; confirme os logs e a aplicação das migrações antes de considerar o ambiente pronto.

## Executar em modo de desenvolvimento

### 1. Iniciar banco e Redis

Na raiz do repositório:

```bash
docker compose -f Conecta/docker-compose.yml up -d postgres redis
```

### 2. Iniciar a API

Em outro terminal, a partir da raiz:

```bash
cd Conecta/apps/ConectaConstrucoes/backend
dotnet run --project Conecta.API/Conecta.API.csproj
```

O perfil local configura a API em http://localhost:5078; o Swagger fica em http://localhost:5078/swagger.

### 3. Iniciar o frontend

Em outro terminal, a partir da raiz:

```bash
cd Conecta/apps/ConectaConstrucoes/frontend
npm ci
npm run dev
```

O Vite informa o endereço local ao iniciar (normalmente http://localhost:5173). Para verificar o frontend, use `npm run lint` e `npm run build` no mesmo diretório.

Para compilar a solução .NET, execute a partir de `Conecta/apps/ConectaConstrucoes/backend`:

```bash
dotnet build Conecta.slnx
```

Não há projetos de teste automatizado identificados atualmente no repositório.

## Configuração

O Compose aceita sobrescritas para as seguintes variáveis. Os valores abaixo são padrões de desenvolvimento definidos em [Conecta/docker-compose.yml](Conecta/docker-compose.yml):

| Variável | Padrão | Uso |
|---|---:|---|
| `POSTGRES_USER` | `admin` | Usuário do PostgreSQL |
| `POSTGRES_PASSWORD` | `admin123` | Senha do PostgreSQL |
| `POSTGRES_DB` | `monorepo_db` | Banco inicial |
| `POSTGRES_PORT` | `5432` | Porta publicada do PostgreSQL |
| `REDIS_PORT` | `6379` | Porta publicada do Redis |
| `BACKEND_PORT` | `5000` | Porta publicada da API |
| `FRONTEND_PORT` | `3000` | Porta publicada do frontend |
| `ASPNETCORE_ENVIRONMENT` | `Development` | Ambiente ASP.NET Core |

Ao executar a API diretamente, a connection string pode ser substituída pela variável .NET `ConnectionStrings__DefaultConnection`. O valor local padrão está em [appsettings.json](Conecta/apps/ConectaConstrucoes/backend/Conecta.API/appsettings.json).

No frontend, `VITE_USE_MOCK` fica ativo por padrão; defina `VITE_USE_MOCK=false` para selecionar o serviço HTTP. `VITE_API_URL` define a base da API e, se omitida, vale `/api`. Como as rotas administrativas correspondentes ainda não estão implementadas no backend, desativar o mock não habilita por si só esses fluxos.

## Segurança e produção

As credenciais e configurações padrão são apenas para desenvolvimento local. Não as reutilize em produção. Antes de publicar o sistema, implemente e valide autenticação/autorização, endpoints de negócio, configuração segura de segredos, política de CORS e exposição controlada do Swagger. O design prevê JWT e perfis de acesso, mas isso não equivale a uma implementação pronta no estado atual do código.