const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('conecta.token')
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })
  if (!res.ok) throw new ApiError(res.status, (await res.text()) || res.statusText)
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T)
}
