import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CategoriaList from '../features/categorias/components/CategoriaList'

// Home.tsx - Pagina inicial do Conecta Construcoes
const Home = () => {
  const navigate = useNavigate()
  const [termo, setTermo] = useState('')

  const buscar = (e: FormEvent) => {
    e.preventDefault()
    const q = termo.trim()
    navigate(q ? `/busca?q=${encodeURIComponent(q)}` : '/busca')
  }

  return (
    <div className="app-shell">
      <header className="app-top">
        <span className="app-top-title">Início</span>
      </header>

      <main className="page">
        <h1 className="greeting">Olá 👋</h1>

        <form className="search-bar" onSubmit={buscar} role="search">
          <input
            type="search"
            placeholder="O que você precisa hoje?"
            aria-label="Buscar serviços"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
          />
        </form>

        <section aria-labelledby="titulo-categorias">
          <div className="section-head">
            <h2 id="titulo-categorias">Categorias</h2>
            <Link to="/busca" className="link">Explorar</Link>
          </div>
          <CategoriaList
            variante="carousel"
            onSelecionar={(c) => navigate(`/busca?categoria=${encodeURIComponent(c.slug)}`)}
          />
        </section>
      </main>
    </div>
  )
}

export default Home
