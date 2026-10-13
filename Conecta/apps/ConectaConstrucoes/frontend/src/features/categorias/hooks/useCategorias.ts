import { useEffect, useState } from 'react'
import { listarCategoriasAtivas } from '../services/categoriaService'
import type { Categoria } from '../types'

type Estado =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ok'; categorias: Categoria[] }

export function useCategorias() {
  const [estado, setEstado] = useState<Estado>({ status: 'loading' })
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let cancelado = false
    listarCategoriasAtivas()
      .then((categorias) => !cancelado && setEstado({ status: 'ok', categorias }))
      .catch((e: unknown) =>
        !cancelado && setEstado({ status: 'error', message: e instanceof Error ? e.message : 'Erro inesperado.' }))
    return () => { cancelado = true }
  }, [tentativa])

  const recarregar = () => {
    setEstado({ status: 'loading' })
    setTentativa((t) => t + 1)
  }

  return { estado, recarregar }
}
