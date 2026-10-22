import { useCallback, useEffect, useRef, useState } from 'react'

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fnRef = useRef(fn)

  useEffect(() => { fnRef.current = fn })

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)
    try { setData(await fnRef.current()) }
    catch (e) { setError(e instanceof Error ? e.message : 'Erro inesperado') }
    finally { setLoading(false) }
  }, [])

  // Carrega os dados quando as dependências mudam (busca em sistema externo: API).
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => { void run() }, deps)

  return { data, setData, loading, error, reload: run }
}
