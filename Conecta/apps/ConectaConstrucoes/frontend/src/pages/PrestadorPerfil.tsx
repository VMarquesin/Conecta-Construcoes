import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './PrestadorPerfil.css'

import carlosAvatar from '../assets/avatars/carlos.jpg'
import capaCarlos from '../assets/portfolio/capa_carlos.jpg'
import pendentesImg from '../assets/portfolio/pendentes.jpg'
import quadroImg from '../assets/portfolio/quadro.jpg'
import ledImg from '../assets/portfolio/led.jpg'
import automacaoImg from '../assets/portfolio/automacao.jpg'

export default function PrestadorPerfil() {
  const navigate = useNavigate()
  const [isFavorited, setIsFavorited] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const [modalOrcamentoAberto, setModalOrcamentoAberto] = useState(false)

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const checklistItens = [
    'Quadro de Luz',
    'Fiação Completa',
    'Instalação de Chuveiro',
    'Projetos de LED',
    'Disjuntores DR',
    'Laudo Técnico',
  ]

  const portfolioItens = [
    {
      id: 1,
      titulo: 'Pendentes Modernos',
      subtitulo: 'Iluminação de sala',
      imagem: pendentesImg,
    },
    {
      id: 2,
      titulo: 'Quadro de Disjuntores',
      subtitulo: 'Norma NBR-5410',
      imagem: quadroImg,
    },
    {
      id: 3,
      titulo: 'Fita LED em Sanca',
      subtitulo: 'Luz indireta e suave',
      imagem: ledImg,
    },
    {
      id: 4,
      titulo: 'Automação Residencial',
      subtitulo: 'Interruptores touch',
      imagem: automacaoImg,
    },
  ]

  const avaliacoes = [
    {
      id: 1,
      iniciais: 'ML',
      avatarClass: 'avatar-blue',
      nome: 'Mariana Lopes',
      data: 'há 3 dias',
      comentario:
        'Serviço impecável! O Carlos trocou toda a fiação da minha cozinha e instalou as luminárias com muito cuidado e rapidez. Super pontual.',
    },
    {
      id: 2,
      iniciais: 'RA',
      avatarClass: 'avatar-amber',
      nome: 'Roberto Almeida',
      data: 'há 1 semana',
      comentario:
        'Excelente profissional. Identificou um problema no quadro que ninguém conseguia resolver. Preço justo e muito educado.',
    },
    {
      id: 3,
      iniciais: 'FC',
      avatarClass: 'avatar-coral',
      nome: 'Fernanda Castro',
      data: 'há 2 semanas',
      comentario:
        'Muito caprichoso na instalação das fitas LED da sala. Recomendo com certeza!',
    },
  ]

  return (
    <div className="perfil-viewport">
      <div className="perfil-container">
        {/* Top Header Navegação */}
        <header className="perfil-top-header">
          <div className="perfil-top-inner">
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
                <span className="home-title">Início</span>
              </div>
            </Link>

            <div className="home-header-actions">
              <button className="header-action-btn" title="Notificações" aria-label="Notificações">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </button>

              <Link to="/admin" className="user-avatar-btn" title="Perfil / Admin">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
            </div>
          </div>
        </header>

        {copiado && (
          <div style={{ position: 'fixed', top: '75px', left: '50%', transform: 'translateX(-50%)', background: '#0f172a', color: '#ffffff', padding: '10px 20px', borderRadius: '999px', fontSize: '13.5px', fontWeight: 600, zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
            ✓ Link do perfil copiado para a área de transferência!
          </div>
        )}

        {/* Layout do Perfil (Grid de 2 Colunas no Desktop) */}
        <main className="perfil-main-layout">
          {/* Coluna Esquerda: Vitrine, Portfólio e Avaliações */}
          <div className="perfil-left-col">
            {/* Imagem de Capa com Botões Flutuantes e Avatar Sobreposto */}
            <div className="cover-wrapper">
              <img src={capaCarlos} alt="Capa do perfil" className="cover-image" />

              <div className="cover-dots">
                <span className="cover-dot active" />
                <span className="cover-dot" />
              </div>

              <div className="cover-overlay-actions">
                <button
                  className="cover-btn"
                  onClick={() => navigate(-1)}
                  title="Voltar"
                  aria-label="Voltar"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                </button>

                <div className="cover-right-btns">
                  <button
                    className="cover-btn"
                    onClick={handleShare}
                    title="Compartilhar Perfil"
                    aria-label="Compartilhar"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                  </button>

                  <button
                    className={`cover-btn ${isFavorited ? 'favorited' : ''}`}
                    onClick={() => setIsFavorited(!isFavorited)}
                    title={isFavorited ? 'Remover dos favoritos' : 'Favoritar'}
                    aria-label="Favoritar"
                  >
                    <svg width="19" height="19" viewBox="0 0 24 24" fill={isFavorited ? '#ef4444' : 'none'} stroke={isFavorited ? '#ef4444' : 'currentColor'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Avatar e Selo de Verificado Sobreposto */}
              <div className="provider-identity-card">
                <div className="provider-avatar-circle">
                  <img src={carlosAvatar} alt="Carlos Silva" className="provider-avatar-img" />
                  <span className="provider-verified-check">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Identidade do Prestador */}
            <div className="provider-header-info">
              <span className="pill-destaque-regiao">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Destaque na Região
              </span>

              <h1 className="provider-fullname">Carlos Silva</h1>
              <p className="provider-specialty-sub">Eletricista Residencial & Predial</p>

              <div className="provider-distance-row">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span>a 1.8 km de você • Centro e arredores</span>
              </div>
            </div>

            {/* Card Investimento Inicial (visível em mobile e desktop) */}
            <div className="investment-card">
              <div className="investment-left">
                <span className="investment-tag">Investimento Inicial</span>
                <span className="investment-val">
                  A partir de R$ 90<small>/hora</small>
                </span>
              </div>

              <div className="investment-free-quote">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <span>Orçamento<br />grátis</span>
              </div>
            </div>

            {/* Grid 2x2 de Métricas / Estatísticas */}
            <div className="stats-2x2-grid">
              <div className="stat-metric-card">
                <div className="stat-icon-circ star">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <div className="stat-text-col">
                  <span className="stat-main-number">
                    4.9 <small>(128)</small>
                  </span>
                  <span className="stat-sub-label">Avaliações</span>
                </div>
              </div>

              <div className="stat-metric-card">
                <div className="stat-icon-circ shield">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                  </svg>
                </div>
                <div className="stat-text-col">
                  <span className="stat-main-number">8 anos</span>
                  <span className="stat-sub-label">Experiência</span>
                </div>
              </div>

              <div className="stat-metric-card">
                <div className="stat-icon-circ lightning">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <div className="stat-text-col">
                  <span className="stat-main-number">&lt; 15 min</span>
                  <span className="stat-sub-label">Resposta ágil</span>
                </div>
              </div>

              <div className="stat-metric-card">
                <div className="stat-icon-circ compass">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                  </svg>
                </div>
                <div className="stat-text-col">
                  <span className="stat-main-number">Até 15 km</span>
                  <span className="stat-sub-label">Raio de serviço</span>
                </div>
              </div>
            </div>

            {/* Sobre o Profissional */}
            <section className="section-block">
              <h2 className="section-block-title">Sobre o profissional</h2>
              <p className="section-block-desc">
                Especialista em instalações elétricas seguras, quadros de distribuição, projetos
                luminotécnicos e padrões de entrada com certificação NR-10. Atendimento pontual, limpo e
                100% transparente.
              </p>

              <div className="checklist-pills-wrap">
                {checklistItens.map((item, idx) => (
                  <span key={idx} className="checklist-pill">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="9 12 11 14 15 10" />
                    </svg>
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </section>

            {/* Trabalhos Realizados (Vitrine de Fotos) */}
            <section className="section-block">
              <div className="portfolio-header-row">
                <h2 className="section-block-title">Trabalhos Realizados</h2>
                <a href="#galeria" className="portfolio-link-count">
                  18 fotos
                </a>
              </div>

              <div className="portfolio-grid-2x2">
                {portfolioItens.map((trab) => (
                  <article key={trab.id} className="portfolio-card-item">
                    <div className="portfolio-img-box">
                      <img src={trab.imagem} alt={trab.titulo} className="portfolio-img" />
                    </div>
                    <div className="portfolio-caption">
                      <h4 className="portfolio-caption-title">{trab.titulo}</h4>
                      <p className="portfolio-caption-sub">{trab.subtitulo}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Banner Conecta Protege */}
            <div className="perfil-protege-banner">
              <div className="protege-shield-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                </svg>
              </div>
              <div className="protege-banner-text">
                <h3 className="protege-banner-title">
                  <span>Conecta Protege</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </h3>
                <p className="protege-banner-desc">
                  Pagamento seguro retido até a conclusão satisfatória do serviço, com suporte
                  prioritário e garantia de refação.
                </p>
              </div>
            </div>

            {/* Avaliações Recentes */}
            <section className="section-block">
              <div className="reviews-header-row">
                <h2 className="section-block-title">Avaliações Recentes</h2>
                <span className="reviews-score-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span>4.9 (128)</span>
                </span>
              </div>

              <div className="reviews-cards-wrap">
                {avaliacoes.map((rev) => (
                  <article key={rev.id} className="review-item-card">
                    <div className="review-user-top">
                      <div className="review-user-left">
                        <div className={`review-initials-avatar ${rev.avatarClass}`}>
                          {rev.iniciais}
                        </div>
                        <div className="review-user-names">
                          <span className="review-name">{rev.nome}</span>
                          <span className="review-date">{rev.data}</span>
                        </div>
                      </div>
                      <span className="review-stars">★★★★★</span>
                    </div>

                    <p className="review-comment">"{rev.comentario}"</p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          {/* Coluna Direita (Sidebar Desktop com Ações de Contratação Fixas) */}
          <aside className="desktop-sticky-sidebar">
            <div className="investment-card" style={{ margin: 0 }}>
              <div className="investment-left">
                <span className="investment-tag">Investimento Estimado</span>
                <span className="investment-val">
                  A partir de R$ 90<small>/hora</small>
                </span>
              </div>
              <div className="investment-free-quote">
                <span>Orçamento<br />sem custo</span>
              </div>
            </div>

            <div className="perfil-protege-banner" style={{ margin: 0 }}>
              <div className="protege-shield-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                </svg>
              </div>
              <div className="protege-banner-text">
                <h4 className="protege-banner-title" style={{ fontSize: '14px' }}>
                  Pagamento Seguro
                </h4>
                <p className="protege-banner-desc" style={{ fontSize: '12px' }}>
                  Garantia de atendimento e liberação de valores somente após validação.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                className="cta-submit-btn"
                style={{ width: '100%', height: '52px' }}
                onClick={() => setModalOrcamentoAberto(true)}
              >
                <span>Solicitar Orçamento</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>

              <button
                className="cta-chat-btn"
                style={{ width: '100%', height: '48px', borderRadius: '14px', gap: '8px' }}
                onClick={() => alert('Iniciando chat com Carlos Silva...')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>Conversar via Chat</span>
              </button>
            </div>
          </aside>
        </main>

        {/* Modal Simulado de Solicitar Orçamento */}
        {modalOrcamentoAberto && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '20px',
            }}
          >
            <div
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                maxWidth: '480px',
                width: '100%',
                padding: '28px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Solicitar Orçamento</h3>
                <button
                  onClick={() => setModalOrcamentoAberto(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}
                >
                  ✕
                </button>
              </div>

              <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>
                Envie os detalhes do seu pedido para <strong>Carlos Silva</strong>. O prestador responderá
                em média em menos de 15 minutos com uma proposta personalizada.
              </p>

              <textarea
                rows={4}
                placeholder="Descreva o que você precisa (ex: troca de disjuntores, instalação de luminária, etc.)..."
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  padding: '12px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  onClick={() => setModalOrcamentoAberto(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    alert('Solicitação de orçamento enviada com sucesso!')
                    setModalOrcamentoAberto(false)
                  }}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#0056d6',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Enviar Pedido
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sticky Action Bar (Mobile View) */}
        <div className="perfil-cta-bottom-bar">
          <div className="cta-bar-inner">
            <div className="cta-price-col">
              <span className="cta-price-hint">Estimativa</span>
              <span className="cta-price-amount">R$ 90<small style={{ fontSize: '12px', color: '#64748b' }}>/hora</small></span>
            </div>

            <div className="cta-buttons-row">
              <button
                className="cta-chat-btn"
                title="Conversar"
                onClick={() => alert('Iniciando chat com Carlos Silva...')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </button>

              <button
                className="cta-submit-btn"
                onClick={() => setModalOrcamentoAberto(true)}
              >
                <span>Solicitar Orçamento</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Barra de Navegação Inferior (Mobile Viewport) */}
        <nav className="home-bottom-nav">
          <Link to="/" className="nav-item">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
