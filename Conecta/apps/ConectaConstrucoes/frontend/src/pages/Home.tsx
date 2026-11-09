import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import HeaderChatButton from '../components/chat/HeaderChatButton'
import AccountTrigger from '../components/session/AccountTrigger'
import { useSession } from '../context/SessionContext'
import { vitrineService, type CategoriaResponse, type PrestadorBuscaItemResponse } from '../features/cliente/services/vitrineService'
import './Home.css'

function getCategoryIcon(slug: string) {
  switch (slug.toLowerCase()) {
    case 'eletrica':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      )
    case 'encanador':
    case 'hidraulica':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      )
    case 'pintura':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="6" rx="2" />
          <path d="M10 9v5a2 2 0 0 0 2 2h0a2 2 0 0 1 2 2v3" />
        </svg>
      )
    case 'reformas':
    case 'alvenaria':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          <path d="m20 16-4-4" />
          <path d="m5 19 4-4" />
        </svg>
      )
    case 'limpeza':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m18 3-9 9" />
          <path d="m14 7 3 3" />
          <path d="M9 12l-4 4a2 2 0 0 0 0 3v0a2 2 0 0 0 3 0l4-4" />
          <path d="M5 21h14" />
        </svg>
      )
    default:
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      )
  }
}

export default function Home() {
  const navigate = useNavigate()
  const { usuario } = useSession()
  const [busca, setBusca] = useState('')
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null)
  const [categorias, setCategorias] = useState<CategoriaResponse[]>([])
  const [profissionais, setProfissionais] = useState<PrestadorBuscaItemResponse[]>([])
  const [loadingCategorias, setLoadingCategorias] = useState(true)
  const [loadingProfissionais, setLoadingProfissionais] = useState(true)

  useEffect(() => {
    vitrineService
      .listarCategorias()
      .then((data) => setCategorias(data))
      .catch((err) => console.error('Erro ao listar categorias:', err))
      .finally(() => setLoadingCategorias(false))
  }, [])

  useEffect(() => {
    setLoadingProfissionais(true)
    vitrineService
      .buscarPrestadores({
        categoria: categoriaAtiva,
        termo: busca.trim() || undefined,
      })
      .then((res) => setProfissionais(res.itens))
      .catch((err) => console.error('Erro ao carregar prestadores:', err))
      .finally(() => setLoadingProfissionais(false))
  }, [categoriaAtiva])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (busca.trim()) {
      navigate(`/busca?q=${encodeURIComponent(busca.trim())}`)
    } else {
      navigate('/busca')
    }
  }

  const handleCategoryClick = (slug: string) => {
    const novoSlug = categoriaAtiva === slug ? null : slug
    setCategoriaAtiva(novoSlug)
  }

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
              <Link to="/pedidos" className="desktop-nav-link">Meus Pedidos</Link>
            </nav>

            {/* Ações da Direita */}
            <div className="home-header-actions">
              <div className="header-location-pill" title="Localização selecionada">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span>São Paulo, SP</span>
              </div>

              <HeaderChatButton />

              <button className="header-action-btn" title="Notificações" aria-label="Notificações">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span className="header-badge-dot" />
              </button>

              <AccountTrigger className="user-profile-widget" title="Minha conta">
                <div className="user-avatar-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="user-profile-text">
                  <span className="user-profile-name">{usuario?.nome.split(' ')[0]}</span>
                  <span className="user-profile-role">Cliente</span>
                </div>
              </AccountTrigger>
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
              {loadingCategorias ? (
                <div style={{ padding: '20px', color: '#64748b', fontSize: '14px' }}>
                  Carregando categorias...
                </div>
              ) : (
                categorias.map((cat) => {
                  const isActive = categoriaAtiva === cat.slug
                  return (
                    <button
                      key={cat.id}
                      className={`category-card ${isActive ? 'active' : ''}`}
                      onClick={() => handleCategoryClick(cat.slug)}
                    >
                      <div className="category-icon-circle">{getCategoryIcon(cat.slug)}</div>
                      <span className="category-label">{cat.nome}</span>
                    </button>
                  )
                })
              )}
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
              {loadingProfissionais ? (
                <div style={{ padding: '30px', color: '#64748b', fontSize: '14px', gridColumn: '1 / -1' }}>
                  Carregando profissionais disponíveis...
                </div>
              ) : profissionais.length === 0 ? (
                <div style={{ padding: '30px', color: '#64748b', fontSize: '14px', gridColumn: '1 / -1' }}>
                  Nenhum profissional encontrado para os filtros selecionados.
                </div>
              ) : (
                profissionais.map((prof) => (
                  <article key={prof.id} className="professional-card">
                    <div className="prof-top">
                      <div className="prof-avatar-wrapper">
                        {prof.avatar ? (
                          <img
                            src={prof.avatar}
                            alt={prof.nome}
                            className="prof-avatar-img"
                          />
                        ) : (
                          <div
                            className="prof-avatar-img"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#0056D6',
                              color: '#ffffff',
                            }}
                          >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          </div>
                        )}
                        <span
                          className={`prof-check-badge ${
                            prof.tipoBadge === 'super' ? 'super' : ''
                          }`}
                        >
                          {prof.tipoBadge === 'super' ? (
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
                          <span className="rating-score">{(prof.avaliacao || 5.0).toFixed(1)}</span>
                          <span className="rating-count">
                            ({prof.numAvaliacoes || 0} avaliações)
                          </span>
                        </div>
                      </div>

                      <span
                        className={`prof-status-pill ${
                          prof.tipoBadge === 'verificado'
                            ? 'pill-verificado'
                            : prof.tipoBadge === 'super'
                            ? 'pill-superprestadora'
                            : 'pill-disponivel'
                        }`}
                      >
                        {prof.badgeTexto || 'Verificado'}
                      </span>
                    </div>

                    <div className="prof-bottom">
                      <span className="prof-distance">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="3 11 22 2 13 21 11 13 3 11" />
                        </svg>
                        {prof.distanciaTexto || (prof.distanciaKm ? `a ${prof.distanciaKm.toFixed(1)} km de você` : 'Próximo a você')}
                      </span>
                      <span className="prof-price">{prof.precoTexto || `R$ ${prof.precoHora}/hora`}</span>
                      
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
                ))
              )}
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

          <Link to="/pedidos" className="nav-item">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>Pedidos</span>
          </Link>

          <AccountTrigger className="nav-item" title="Minha conta">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Perfil</span>
          </AccountTrigger>
        </nav>
      </div>
    </div>
  )
}
