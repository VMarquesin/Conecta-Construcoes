Descrição

Resumo
Criar a conteinerização da aplicação Conecta com Docker.  
Isso inclui os arquivos Dockerfile para o back-end (.NET) e para o front-end (Web/React), além da orquestração dos serviços com PostgreSQL usando Docker Compose.

Contexto
A demanda busca padronizar os ambientes de desenvolvimento, homologação e execução do projeto.  
Com containers, todos passam a usar a mesma versão de .NET, Node.js/React e PostgreSQL. Isso evita divergências de sistema operacional e dependências locais.

Critérios de aceitação
Criar um Dockerfile otimizado para o back-end em .NET.

O Dockerfile do back-end deve considerar as etapas de build, publicação e execução do binário.

Criar um Dockerfile otimizado para o front-end Web.

O Dockerfile do front-end deve considerar o build dos arquivos estáticos e a exposição do servidor web ou proxy.

Criar um arquivo docker-compose.yml na raiz do projeto.

O docker-compose.yml deve subir ao mesmo tempo o PostgreSQL, a API .NET e a aplicação Web.

O PostgreSQL deve ter persistência de dados em volume.

As variáveis de ambiente, como string de conexão do banco e portas de comunicação, devem ser injetadas dinamicamente via arquivos .env.

O ambiente completo deve subir e se comunicar corretamente com um único comando: docker compose up --build.

---

> 📋 **Plano de Implementação Detalhado:** Consulte o documento arquitetural completo com diagnóstico, gestão de dependências DDD, stack de dados híbrida (EF Core + Dapper + Evolve) e orquestração Docker em [plano-implementacao.md](file:///c:/Users/gabri/Documents/GitHub/Conecta-Construcoes/.antigravit/plano-implementacao.md).