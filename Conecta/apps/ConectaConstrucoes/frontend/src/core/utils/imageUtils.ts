/**
 * Resolve e formata URLs de imagens para garantir que arquivos físicos servidos
 * pelo backend (ex: /uploads/portfolio/foto.jpg) sejam devidamente concatenados
 * com a variável de ambiente da API (VITE_API_URL), evitando imagens quebradas.
 */
export function formatarUrlImagem(url?: string | null): string {
  if (!url) return ''

  // URLs absolutas ou data/blob URLs já estão prontas
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url
  }

  const rawApiUrl = (import.meta.env.VITE_API_URL as string | undefined) || ''
  const cleanPath = url.startsWith('/') ? url : `/${url}`

  if (rawApiUrl) {
    // Extrai o host base (ex: http://localhost:5000 se VITE_API_URL for http://localhost:5000/api/v1)
    const baseHost = rawApiUrl.replace(/\/api(\/v\d+)?\/?$/, '')
    return `${baseHost}${cleanPath}`
  }

  // No Vite dev ou Nginx, o caminho relativo /uploads/... é redirecionado via proxy
  return cleanPath
}
