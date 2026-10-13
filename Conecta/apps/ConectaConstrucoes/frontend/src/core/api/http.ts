const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/** Cliente HTTP (fetch) para a API REST do Conecta. */
export async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { Accept: 'application/json', ...init.headers },
    })
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor.')
  }
  if (!res.ok) throw new ApiError(res.status, `Erro ${res.status} ao consultar o servidor.`)
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T)
}
