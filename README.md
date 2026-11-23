# Conecta-Construcoes

Para resetar completamente os containers, destruir os volumes antigos (limpando o PostgreSQL do zero), reconstruir as imagens atualizadas e rodar o seed_teste_local.sql de forma 100% segura contra falhas de encoding no PowerShell, siga os passos abaixo:

Passo 1: Limpar os Volumes e Derrubar os Containers

Abra o PowerShell na pasta raiz do projeto (c:\Users\Marquesin\Documents\GitHub\Conecta-Construcoes\Conecta) e execute:

powershell
# 1. Para e remove todos os containers e apaga os volumes do Postgres e Redis (-v)
docker compose down -v

O argumento -v é essencial para deletar o volume postgres_data, garantindo que o banco de dados seja recriado limpo.

Passo 2: Reconstruir as Imagens e Iniciar os Serviços
powershell
# 2. Reconstrói o Backend e o Frontend sem usar cache das camadas antigas
docker compose build --no-cache
# 3. Sobe todos os serviços em background
docker compose up -d

Aguarde cerca de 10 a 15 segundos para o container monorepo-postgres inicializar e o conecta-backend rodar as migrations automáticas do banco (V1_0 e V2_0). Você pode acompanhar o log de inicialização com:

powershell
docker logs -f conecta-backend
# Assim que exibir "Now listening on: http://[::]:5000", pressione Ctrl+C
Passo 3: Executar o Script de Seed (Imune a Erros de Encoding no Windows)

Para evitar que o PowerShell corrompa a acentuação (como Instala??es) ao canalizar via pipe, copie o arquivo diretamente para dentro do container Linux e execute-o nativamente:

powershell
# 4. Copia o arquivo SQL para dentro do container PostgreSQL
docker cp seed_teste_local.sql monorepo-postgres:/seed_teste_local.sql
# 5. Executa o script diretamente pelo psql interno em UTF-8
docker exec -i monorepo-postgres psql -U admin -d monorepo_db -f /seed_teste_local.sql
Passo 4: Credenciais Prontas para Teste

Todos os usuários foram gerados com a senha padrão: admin123

Perfil	Nome	E-mail	Senha
Administrador	Admin Master Conecta	admin@conecta.com	admin123
Cliente	Matheus Oliveira	matheus@conecta.com	admin123
Cliente	Mariana Lopes	mariana@conecta.com	admin123
Cliente	Fernanda Castro	fernanda@conecta.com	admin123
Prestador	Carlos Silva (Eletricista)	carlos@conecta.com	admin123
Prestador	Roberto Almeida (Encanador)	roberto@conecta.com	admin123
Prestador	Lucas Mendes (Pintor)	lucas@conecta.com	admin123
Prestador	Juliana Ramos (Alvenaria)	juliana@conecta.com	admin123
Prestador	Marcelo Silveira (Limpeza)	marcelo@conecta.com	admin123

Após esse processo, acesse o frontend em http://localhost:3000 (ou porta configurada) e faça o login com qualquer um dos usuários acima.