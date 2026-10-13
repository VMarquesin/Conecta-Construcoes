import { useState } from 'react'
import { useCategorias } from '../hooks/useCategorias'
import type { Categoria } from '../types'

function CategoriaIcone({ categoria }: { categoria: Categoria }) {
  const [falhou, setFalhou] = useState(false)
  if (!categoria.iconeUrl || falhou) {
    return <span className="cat-fallback" aria-hidden="true">{categoria.nome.charAt(0).toUpperCase()}</span>
  }
  return <img src={categoria.iconeUrl} alt="" loading="lazy" onError={() => setFalhou(true)} />
}

interface Props {
  /** `carousel`: ícones roláveis (Home). `chips`: pílulas para filtros de busca. */
  variante?: 'carousel' | 'chips'
  /** Slug da categoria selecionada (variante chips). */
  selecionada?: string | null
  onSelecionar: (categoria: Categoria) => void
}

/** Lista reutilizável de categorias ativas, buscadas na API. Trata loading e erro. */
export default function CategoriaList({ variante = 'carousel', selecionada, onSelecionar }: Props) {
  const { estado, recarregar } = useCategorias()

  if (estado.status === 'loading') {
    return (
      <div className={`cat-list ${variante}`} role="status" aria-label="Carregando categorias">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="cat-skeleton"><span /><i /></div>
        ))}
      </div>
    )
  }

  if (estado.status === 'error') {
    return (
      <div className="cat-error" role="alert">
        <p>Não foi possível carregar as categorias.</p>
        <small>{estado.message}</small>
        <button type="button" onClick={recarregar}>Tentar novamente</button>
      </div>
    )
  }

  if (estado.categorias.length === 0) {
    return <p className="cat-empty">Nenhuma categoria disponível no momento.</p>
  }

  return (
    <ul className={`cat-list ${variante}`}>
      {estado.categorias.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            className={`cat-item${selecionada === c.slug ? ' active' : ''}`}
            aria-pressed={variante === 'chips' ? selecionada === c.slug : undefined}
            onClick={() => onSelecionar(c)}
          >
            <span className="cat-icon"><CategoriaIcone categoria={c} /></span>
            <span className="cat-nome">{c.nome}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
