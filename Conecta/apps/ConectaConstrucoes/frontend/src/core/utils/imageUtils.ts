/**
 * Resolve e formata URLs de imagens para garantir que arquivos físicos servidos
 * pelo backend (ex: /uploads/portfolio/foto.jpg) sejam devidamente concatenados
 * com a variável de ambiente da API (VITE_API_URL) ou fallback para a porta 5000,
 * evitando que o front-end tente carregar imagens em localhost:3000 (gerando 404).
 */
export function obterApiBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim()
  if (envUrl && (envUrl.startsWith('http://') || envUrl.startsWith('https://'))) {
    return envUrl.replace(/\/api(\/v\d+)?\/?$/, '')
  }
  // Fallback padrão para o backend .NET na porta 5000
  return 'http://localhost:5000'
}

export function formatarUrlImagem(url?: string | null): string {
  if (!url) return ''

  // URLs absolutas ou data/blob URLs já estão completas
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url
  }

  const baseHost = obterApiBaseUrl()
  const cleanPath = url.startsWith('/') ? url : `/${url}`
  return `${baseHost}${cleanPath}`
}
