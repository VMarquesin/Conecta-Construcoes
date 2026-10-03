# Stage 1: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000

# Stage 2: SDK Build & Restore
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copiar os arquivos .csproj preservando a hierarquia para cache do restore
COPY ["Conecta.API/Conecta.API.csproj", "Conecta.API/"]
COPY ["Conecta.Application/Conecta.Application.csproj", "Conecta.Application/"]
COPY ["Conecta.Domain/Conecta.Domain.csproj", "Conecta.Domain/"]
COPY ["Conecta.Infrastructure/Conecta.Infrastructure.csproj", "Conecta.Infrastructure/"]

# Restaurar dependências
RUN dotnet restore "Conecta.API/Conecta.API.csproj"

# Copiar todo o código-fonte restante
COPY . .

# Compilar e publicar a API em modo Release
WORKDIR "/src/Conecta.API"
RUN dotnet publish "Conecta.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Imagem final para execução
FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Conecta.API.dll"]
