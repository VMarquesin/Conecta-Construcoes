import { http } from '../../../core/api/http'
import type { Categoria } from '../types'

/** Formato aceito da API (camelCase ou snake_case, conforme o schema `categorias`). */
interface CategoriaDto {
  id: number
  nome: string
  slug: string
  descricao?: string | null
  iconeUrl?: string | null
  icone_url?: string | null
  ativo?: boolean
}

/** Busca as categorias ativas no endpoint público do back-end. */
export async function listarCategoriasAtivas(): Promise<Categoria[]> {
  const dados = await http<CategoriaDto[]>('/categorias')
  return dados
    .filter((c) => c.ativo !== false)
    .map((c) => ({
      id: c.id,
      nome: c.nome,
      slug: c.slug,
      descricao: c.descricao ?? undefined,
      iconeUrl: c.iconeUrl ?? c.icone_url ?? undefined,
    }))
}
