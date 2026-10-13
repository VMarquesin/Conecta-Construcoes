import { Link, useSearchParams } from 'react-router-dom'
import CategoriaList from '../features/categorias/components/CategoriaList'

// Busca.tsx - Pagina de busca filtrada por categoria (slug na query string)
const Busca = () => {
  const [params, setParams] = useSearchParams()
  const categoria = params.get('categoria')
  const q = params.get('q')

  const selecionar = (slug: string) => {
    const p = new URLSearchParams(params)
    if (categoria === slug) p.delete('categoria')
    else p.set('categoria', slug)
    setParams(p)
  }

  return (
    <div className="app-shell">
      <header className="app-top">
        <Link to="/" className="link">← Início</Link>
        <span className="app-top-title">Buscar</span>
      </header>

      <main className="page">
        <h1 className="greeting">Buscar serviços</h1>

        <section aria-labelledby="filtro-categorias">
          <h2 id="filtro-categorias" className="sr-only">Filtrar por categoria</h2>
          <CategoriaList variante="chips" selecionada={categoria} onSelecionar={(c) => selecionar(c.slug)} />
        </section>

        <p className="muted">
          {categoria ? <>Categoria: <b>{categoria}</b>. </> : null}
          {q ? <>Termo: <b>{q}</b>. </> : null}
          {!categoria && !q ? 'Selecione uma categoria ou digite um termo.' : null}
        </p>
      </main>
    </div>
  )
}

export default Busca
