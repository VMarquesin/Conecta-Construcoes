const RAW_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api/v1'
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, '')

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export function obterTokenAutenticacao(): string | null {
  try {
    return (
      localStorage.getItem('conecta.token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('conecta_token') ||
      localStorage.getItem('conecta.jwt') ||
      null
    )
  } catch {
    return null
  }
}

export async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = obterTokenAutenticacao()
  let url: string

  if (path.startsWith('http://') || path.startsWith('https://')) {
    url = path
  } else {
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    if (cleanPath.startsWith('/api/v1')) {
      if (BASE_URL.startsWith('http://') || BASE_URL.startsWith('https://')) {
        const host = BASE_URL.replace(/\/api(\/v\d+)?\/?$/, '')
        url = `${host}${cleanPath}`
      } else {
        url = cleanPath
      }
    } else {
      url = `${BASE_URL}${cleanPath}`
    }
  }

  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(url, {
    ...init,
    headers: {
      ...headers,
      ...init.headers,
    },
  })
  if (!res.ok) throw new ApiError(res.status, (await res.text()) || res.statusText)
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T)
}
