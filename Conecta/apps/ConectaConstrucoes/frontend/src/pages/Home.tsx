import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Home.css'

import carlosAvatar from '../assets/avatars/carlos.jpg'
import marianaAvatar from '../assets/avatars/mariana.jpg'
import robertoAvatar from '../assets/avatars/roberto.jpg'
import anaAvatar from '../assets/avatars/ana.jpg'

interface Professional {
  id: number
  nome: string
  profissao: string
  categoria: string
  avaliacao: number
  numAvaliacoes: number
  badgeTipo: 'verificado' | 'super' | 'disponivel'
  badgeTexto: string
  distancia: string
  precoHora: number
  avatar: string
}

const PROFISSIONAIS_INICIAIS: Professional[] = [
  {
    id: 1,
    nome: 'Carlos Silva',
    profissao: 'Eletricista Residencial',
    categoria: 'eletrica',
    avaliacao: 4.9,
    numAvaliacoes: 128,
    badgeTipo: 'verificado',
    badgeTexto: 'Verificado',
    distancia: '1.8 km',
    precoHora: 90,
    avatar: carlosAvatar,
  },
  {
    id: 2,
    nome: 'Mariana Costa',
    profissao: 'Pintora & Acabamentos',
    categoria: 'pintura',
    avaliacao: 5.0,
    numAvaliacoes: 94,
    badgeTipo: 'super',
    badgeTexto: 'Superprestadora',
    distancia: '2.5 km',
    precoHora: 110,
    avatar: marianaAvatar,
  },
  {
    id: 3,
    nome: 'Roberto Mendes',
    profissao: 'Encanador & Desentupimento',
    categoria: 'encanador',
    avaliacao: 4.8,
    numAvaliacoes: 210,
    badgeTipo: 'verificado',
    badgeTexto: 'Verificado',
    distancia: '3.1 km',
    precoHora: 85,
    avatar: robertoAvatar,
  },
  {
    id: 4,
    nome: 'Ana Oliveira',
    profissao: 'Reformas & Pequenos Reparos',
    categoria: 'reformas',
    avaliacao: 4.9,
    numAvaliacoes: 67,
    badgeTipo: 'disponivel',
    badgeTexto: 'Disponível Hoje',
    distancia: '4.0 km',
    precoHora: 95,
    avatar: anaAvatar,
  },
]

const CATEGORIAS = [
  {
    id: 'eletrica',
    nome: 'Elétrica',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    id: 'encanador',
    nome: 'Encanador',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    id: 'pintura',
    nome: 'Pintura',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="6" rx="2" />
        <path d="M10 9v5a2 2 0 0 0 2 2h0a2 2 0 0 1 2 2v3" />
      </svg>
    ),
  },
  {
    id: 'reformas',
    nome: 'Reformas',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        <path d="m20 16-4-4" />
        <path d="m5 19 4-4" />
      </svg>
    ),
  },
  {
    id: 'limpeza',
    nome: 'Limpeza',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m18 3-9 9" />
        <path d="m14 7 3 3" />
        <path d="M9 12l-4 4a2 2 0 0 0 0 3v0a2 2 0 0 0 3 0l4-4" />
        <path d="M5 21h14" />
      </svg>
    ),
  },
]

export default function Home() {
  const navigate = useNavigate()
  const [busca, setBusca] = useState('')
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (busca.trim()) {
      navigate(`/busca?q=${encodeURIComponent(busca.trim())}`)
    } else {
      navigate('/busca')
    }
  }

  const handleCategoryClick = (catId: string) => {
    setCategoriaAtiva(catId)
    navigate(`/busca?categoria=${catId}`)
  }

  const profissionaisFiltrados = PROFISSIONAIS_INICIAIS.filter((p) => {
    const matchBusca =
      busca.trim() === '' ||
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.profissao.toLowerCase().includes(busca.toLowerCase())

    const matchCategoria = !categoriaAtiva || p.categoria === categoriaAtiva

    return matchBusca && matchCategoria
  })

  return (
    <div className="home-viewport">
      <div className="home-container">
        {/* Header Superior Responsivo */}
        <header className="home-header">
          <div className="header-inner">
            <Link to="/" className="home-brand">
              <div className="home-brand-logo">
                <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="9" fill="#0056D6" />
                  <path
                    d="M9 16.5L13.5 21L23 11.5"
                    stroke="white"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="home-brand-text">
                <span className="home-title">Conecta</span>
                <span className="home-brand-tag">Construções</span>
              </div>
            </Link>

            {/* Navegação Desktop */}
            <nav className="desktop-nav">
              <Link to="/" className="desktop-nav-link active">Início</Link>
              <Link to="/busca" className="desktop-nav-link">Buscar Serviços</Link>
              <a href="#categorias" className="desktop-nav-link">Categorias</a>
              <a href="#profissionais" className="desktop-nav-link">Profissionais</a>
              <Link to="/admin" className="desktop-nav-link">Painel Admin</Link>
            </nav>

            {/* Ações da Direita */}
            <div className="home-header-actions">
              <div className="header-location-pill" title="Localização selecionada">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span>São Paulo, SP</span>
              </div>

              <button className="header-action-btn" title="Notificações" aria-label="Notificações">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span className="header-badge-dot" />
              </button>

              <Link to="/admin" className="user-profile-widget" title="Meu Perfil / Painel Admin">
                <div className="user-avatar-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="user-profile-text">
                  <span className="user-profile-name">Matheus</span>
                  <span className="user-profile-role">Admin / Cliente</span>
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main className="home-main">
          {/* Seção Hero: Boas-vindas + Banner Conecta Segura (Lado a lado no Desktop) */}
          <section className="hero-grid">
            <div className="hero-welcome-card">
              <div className="greeting-section">
                <div className="greeting-info">
                  <div className="location-tag">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <span>São Paulo, SP</span>
                  </div>
                  <h1 className="user-greeting">
                    Olá, Matheus <span className="wave-hand">👋</span>
                  </h1>
                  <p className="hero-subtitle">
                    Encontre prestadores qualificados e verificados para sua obra ou reforma.
                  </p>
                </div>

                <div className="garantia-badge">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#854d0e">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                  </svg>
                  <span>Garantia Ativa</span>
                </div>
              </div>

              {/* Formulário de Busca */}
              <form className="search-wrapper" onSubmit={handleSearchSubmit}>
                <span className="search-icon-left">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  type="text"
                  className="search-input-box"
                  placeholder="O que você precisa hoje?"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
                <button
                  type="submit"
                  className="search-filter-btn"
                  title="Buscar profissionais"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="21" x2="4" y2="14" />
                    <line x1="4" y1="10" x2="4" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12" y2="3" />
                    <line x1="20" y1="21" x2="20" y2="16" />
                    <line x1="20" y1="12" x2="20" y2="3" />
                    <line x1="1" y1="14" x2="7" y2="14" />
                    <line x1="9" y1="8" x2="15" y2="8" />
                    <line x1="17" y1="16" x2="23" y2="16" />
                  </svg>
                </button>
              </form>
            </div>

            {/* Banner CONECTA SEGURA */}
            <div className="conecta-segura-banner">
              <svg
                className="banner-shield-watermark"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>

              <div>
                <span className="banner-tag">CONECTA SEGURA</span>
                <h3 className="banner-title">Profissionais verificados e garantia</h3>
                <p className="banner-description">
                  Atendimento com respaldo completo e pagamentos protegidos até o fim.
                </p>
              </div>

              <Link to="/busca" className="banner-link">
                <span>Saiba mais</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </section>

          {/* Categorias */}
          <section id="categorias">
            <div className="section-header">
              <h2 className="section-title">Categorias</h2>
              <Link to="/busca" className="section-action-link">
                Explorar todos
              </Link>
            </div>

            <div className="categories-grid">
              {CATEGORIAS.map((cat) => {
                const isActive = categoriaAtiva === cat.id
                return (
                  <button
                    key={cat.id}
                    className={`category-card ${isActive ? 'active' : ''}`}
                    onClick={() => handleCategoryClick(cat.id)}
                  >
                    <div className="category-icon-circle">{cat.icon}</div>
                    <span className="category-label">{cat.nome}</span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Profissionais perto de você */}
          <section id="profissionais">
            <div className="section-header">
              <h2 className="section-title">
                Profissionais perto de você <span className="online-dot" />
              </h2>
              <Link to="/busca" className="section-action-link">
                Ver todos
              </Link>
            </div>

            <div className="professionals-grid">
              {profissionaisFiltrados.map((prof) => (
                <article key={prof.id} className="professional-card">
                  <div className="prof-top">
                    <div className="prof-avatar-wrapper">
                      <img
                        src={prof.avatar}
                        alt={prof.nome}
                        className="prof-avatar-img"
                      />
                      <span
                        className={`prof-check-badge ${
                          prof.badgeTipo === 'super' ? 'super' : ''
                        }`}
                      >
                        {prof.badgeTipo === 'super' ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        ) : (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                    </div>

                    <div className="prof-main-info">
                      <h4 className="prof-name">{prof.nome}</h4>
                      <p className="prof-service">{prof.profissao}</p>
                      <div className="prof-rating-row">
                        <span className="star-icon">★</span>
                        <span className="rating-score">{prof.avaliacao.toFixed(1)}</span>
                        <span className="rating-count">
                          ({prof.numAvaliacoes} avaliações)
                        </span>
                      </div>
                    </div>

                    <span
                      className={`prof-status-pill ${
                        prof.badgeTipo === 'verificado'
                          ? 'pill-verificado'
                          : prof.badgeTipo === 'super'
                          ? 'pill-superprestadora'
                          : 'pill-disponivel'
                      }`}
                    >
                      {prof.badgeTexto}
                    </span>
                  </div>

                  <div className="prof-bottom">
                    <span className="prof-distance">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="3 11 22 2 13 21 11 13 3 11" />
                      </svg>
                      a {prof.distancia} de você
                    </span>
                    <span className="prof-price">R$ {prof.precoHora}/hora</span>
                    
                    {/* Botão Ver Perfil SEMPRE presente no card (mobile e desktop) */}
                    <button
                      className="prof-action-btn"
                      onClick={() => navigate(`/prestador/${prof.id}`)}
                      title={`Ver perfil completo de ${prof.nome}`}
                    >
                      <span>Ver Perfil</span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Card de Suporte Imediato */}
          <section className="support-card">
            <div className="support-left">
              <div className="support-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div className="support-texts">
                <h4 className="support-title">Precisa de suporte imediato?</h4>
                <p className="support-subtitle">Central de ajuda disponível 24h por dia com atendimento humanizado</p>
              </div>
            </div>

            <div className="support-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </section>
        </main>

        {/* Rodapé Desktop */}
        <footer className="home-desktop-footer">
          <div className="footer-inner">
            <span>© 2026 Conecta Construções - Todos os direitos reservados.</span>
            <div className="footer-links">
              <Link to="/busca">Buscar Serviços</Link>
              <a href="#">Termos de Uso</a>
              <a href="#">Privacidade</a>
              <a href="#">Segurança & Garantia</a>
              <Link to="/admin">Administração</Link>
            </div>
          </div>
        </footer>

        {/* Barra de Navegação Inferior (Mobile Viewport) */}
        <nav className="home-bottom-nav">
          <Link to="/" className="nav-item active">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Início</span>
          </Link>

          <Link to="/busca" className="nav-item">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>Buscar</span>
          </Link>

          <Link to="/" className="nav-item">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>Pedidos</span>
          </Link>

          <Link to="/admin" className="nav-item">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Perfil</span>
          </Link>
        </nav>
      </div>
    </div>
  )
}
