import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import HeaderChatButton from '../../components/chat/HeaderChatButton'
import { useChat } from '../../context/ChatContext'
import './ProDashboard.css'

import lucasAvatar from '../../assets/avatars/lucas.jpg'
import julianaAvatar from '../../assets/avatars/juliana.jpg'
import robertoAvatar from '../../assets/avatars/roberto.jpg'
import carlosAvatar from '../../assets/avatars/carlos.jpg'

export default function ProDashboard() {
  const navigate = useNavigate()
  const { abrirChat } = useChat()

  const [disponivel, setDisponivel] = useState(true)
  const [pedidosPendentes, setPedidosPendentes] = useState([
    {
      id: '1042',
      clienteNome: 'Matheus Oliveira',
      clienteAvatar: lucasAvatar,
      tempoRelativo: '12 min',
      localTexto: 'Centro, Tupã • a 1.8 km',
      tags: ['! Urgente', 'Elétrica'],
      isUrgente: true,
      descricao: 'Troca de fiação do chuveiro e disjuntores no quadro de energia.',
    },
    {
      id: '1043',
      clienteNome: 'Juliana Mendes',
      clienteAvatar: julianaAvatar,
      tempoRelativo: '35 min',
      localTexto: 'Jardim América, Tupã • a 3.2 km',
      tags: ['Elétrica', 'Cozinha'],
      isUrgente: false,
      descricao: 'Instalação de 4 tomadas 20A na cozinha e revisão de fiação.',
    },
    {
      id: '1044',
      clienteNome: 'Roberto Sanches',
      clienteAvatar: robertoAvatar,
      tempoRelativo: '1 hora',
      localTexto: 'Vila Nova, Tupã • a 4.0 km',
      tags: ['Instalação', 'Residencial'],
      isUrgente: false,
      descricao: 'Instalação de ventilador de teto e troca de luminárias da sala.',
    },
  ])

  const handleRecusar = (id: string, cliente: string) => {
    if (confirm(`Deseja recusar a solicitação de ${cliente}?`)) {
      setPedidosPendentes((prev) => prev.filter((p) => p.id !== id))
    }
  }

  return (
    <div className="pro-viewport">
      <div className="pro-container">
        {/* Header Superior Conecta PRO */}
        <header className="pro-header">
          <div className="pro-header-inner">
            <Link to="/pro" className="pro-brand">
              <div className="pro-brand-logo">
                <span>C</span>
              </div>
              <div className="pro-brand-title-wrap">
                <span className="pro-brand-name">Conecta</span>
                <span className="pro-badge-tag">PRO</span>
              </div>
            </Link>

            {/* Menu Desktop do Prestador */}
            <nav className="pro-desktop-nav">
              <Link to="/pro" className="pro-nav-link active">Painel Pro</Link>
              <Link to="/pro/solicitacao/1042" className="pro-nav-link">Solicitações</Link>
              <Link to="/pro/portfolio" className="pro-nav-link">Meu Portfólio</Link>
              <Link to="/" className="pro-nav-link pro-mode-switch" title="Ver como Cliente">
                Modo Cliente
              </Link>
            </nav>

            <div className="pro-header-actions">
              <HeaderChatButton />

              <button className="pro-header-icon-btn" title="Notificações" aria-label="Notificações">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span className="pro-badge-dot" />
              </button>

              <Link to="/prestador/1" className="pro-avatar-btn" title="Minha Vitrine Pública">
                <img src={carlosAvatar} alt="Carlos Silva" className="pro-avatar-img-header" />
              </Link>
            </div>
          </div>
        </header>

        {/* Conteúdo Principal do Painel */}
        <main className="pro-main">
          {/* 1. Card Perfil e Disponibilidade */}
          <div className="pro-profile-card">
            <div className="pro-profile-header-row">
              <div className="pro-profile-id-col">
                <span className="pro-badge-verified">
                  Painel do Profissional
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12l2.5 2.5L16 9" stroke="white" strokeWidth="2.5" />
                  </svg>
                </span>
                <h1 className="pro-welcome-title">Olá, Carlos Silva</h1>
                <p className="pro-profession-sub">Eletricista Residencial e Predial em Tupã</p>
              </div>

              <div className="pro-status-toggle-wrap">
                <button
                  className={`pro-status-pill-toggle ${disponivel ? 'disponivel' : 'ocupado'}`}
                  onClick={() => setDisponivel(!disponivel)}
                  title="Clique para alternar disponibilidade"
                >
                  <span className="status-indicator-circle" />
                  <span>{disponivel ? 'Disponível' : 'Ocupado'}</span>
                </button>
              </div>
            </div>

            <div className="pro-visibility-pill">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0056D6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>Visível para clientes em Tupã e raio de 15 km</span>
            </div>
          </div>

          {/* 2. Resumo da Semana (Métricas) */}
          <section className="pro-metrics-section">
            <div className="pro-section-title-row">
              <h2 className="pro-section-title">Resumo da Semana</h2>
              <span className="pro-updated-tag">Atualizado agora</span>
            </div>

            <div className="pro-metrics-grid">
              {/* Card 1: Aguardando */}
              <div className="pro-metric-card">
                <div className="metric-header-row">
                  <div className="metric-icon-wrap icon-yellow">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.2">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  </div>
                  <span className="metric-badge-yellow">Aguardando</span>
                </div>
                <div className="metric-main-val">{pedidosPendentes.length}</div>
                <span className="metric-sub-label">Novos Pedidos</span>
              </div>

              {/* Card 2: Avaliação */}
              <div className="pro-metric-card">
                <div className="metric-header-row">
                  <span className="metric-star-icon">★</span>
                  <span className="metric-badge-blue">Top Pro</span>
                </div>
                <div className="metric-main-val">
                  4.9 <small>/ 5.0</small>
                </div>
                <span className="metric-sub-label">128 avaliações</span>
              </div>

              {/* Card 3: Ganhos */}
              <div className="pro-metric-card">
                <div className="metric-header-row">
                  <div className="metric-icon-wrap icon-green">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2">
                      <rect x="2" y="6" width="20" height="12" rx="2" />
                      <circle cx="12" cy="12" r="2" />
                      <path d="M6 12h.01M18 12h.01" />
                    </svg>
                  </div>
                </div>
                <div className="metric-main-val text-green">R$ 840</div>
                <span className="metric-sub-label">Ganhos da semana</span>
              </div>
            </div>
          </section>

          {/* 3. Próximo Serviço Agendado */}
          <section className="pro-next-service-section">
            <div className="pro-section-title-row">
              <div className="pro-subtitle-with-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0056D6" strokeWidth="2.2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <h2 className="pro-section-title">Próximo Serviço Agendado</h2>
              </div>
              <span className="pro-tag-hoje">Hoje</span>
            </div>

            <div className="pro-scheduled-card">
              <div className="scheduled-top-row">
                <div className="scheduled-time-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0056D6" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span className="scheduled-time">16:00</span>
                </div>
                <span className="scheduled-badge-confirmed">Confirmado</span>
              </div>

              <h3 className="scheduled-service-title">Manutenção de disjuntor principal</h3>

              <div className="scheduled-meta-list">
                <div className="scheduled-meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>Ana Paula Silva</span>
                </div>

                <div className="scheduled-meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>Av. Tamoios, 1200 - Centro, Tupã</span>
                </div>
              </div>

              <div className="scheduled-actions-row">
                <button
                  className="btn-gps-route"
                  onClick={() => window.open('https://maps.google.com/?q=Av.+Tamoios+1200+Tupa', '_blank')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                  </svg>
                  <span>Ver rota no GPS</span>
                </button>

                <button
                  className="btn-scheduled-chat"
                  title="Conversar com a cliente"
                  onClick={() => abrirChat('carlos-silva')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </section>

          {/* 4. Aguardando sua resposta (Pedidos Pendentes) */}
          <section className="pro-pending-requests-section">
            <div className="pending-heading-block">
              <div className="pending-title-row">
                <h2 className="pro-section-title">Aguardando sua resposta</h2>
                <span className="pending-count-bubble">{pedidosPendentes.length}</span>
              </div>
              <p className="pending-ranking-hint">
                ⚡ Responda rápido para manter sua nota alta no ranking
              </p>
            </div>

            <div className="pending-cards-list">
              {pedidosPendentes.length === 0 ? (
                <div className="pending-empty-box">
                  <p>Você respondeu a todas as solicitações pendentes!</p>
                </div>
              ) : (
                pedidosPendentes.map((req) => (
                  <article key={req.id} className="pro-request-card">
                    <div className="request-card-header">
                      <div className="request-client-col">
                        <img src={req.clienteAvatar} alt={req.clienteNome} className="request-client-avatar" />
                        <div>
                          <h4 className="request-client-name">{req.clienteNome}</h4>
                          <span className="request-client-location">{req.localTexto}</span>
                        </div>
                      </div>
                      <span className="request-time-ago">🕒 {req.tempoRelativo}</span>
                    </div>

                    <div className="request-tags-row">
                      {req.tags.map((t) => (
                        <span
                          key={t}
                          className={`request-chip ${t.includes('Urgente') ? 'chip-urgente' : 'chip-padrao'}`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <p className="request-description-quote">“{req.descricao}”</p>

                    <div className="request-actions-row">
                      <button
                        className="btn-pro-analisar"
                        onClick={() => navigate(`/pro/solicitacao/${req.id}`)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span>Analisar</span>
                      </button>

                      <button
                        className="btn-pro-recusar"
                        onClick={() => handleRecusar(req.id, req.clienteNome)}
                      >
                        Recusar
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>

            {/* Dica para Faturar Mais */}
            <div className="pro-tip-box">
              <div className="tip-icon-circle">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0056D6" strokeWidth="2.2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
              <div className="tip-text-col">
                <strong className="tip-title">Dica para faturar mais</strong>
                <p className="tip-desc">
                  Profissionais que respondem em até 15 minutos fecham 3x mais orçamentos em Tupã.
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Barra de Navegação Inferior (Mobile Viewport) */}
        <nav className="pro-bottom-nav">
          <Link to="/pro" className="pro-bottom-item active">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>Início</span>
          </Link>

          <Link to="/pro/solicitacao/1042" className="pro-bottom-item">
            <div className="bottom-badge-wrap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="bottom-dot-badge">3</span>
            </div>
            <span>Pedidos</span>
          </Link>

          <button
            className="pro-bottom-item"
            onClick={() => alert('Abrindo agenda de atendimentos do profissional...')}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Agenda</span>
          </button>

          <Link to="/pro/portfolio" className="pro-bottom-item">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            <span>Portfólio</span>
          </Link>

          <Link to="/prestador/1" className="pro-bottom-item">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Perfil Pro</span>
          </Link>
        </nav>
      </div>
    </div>
  )
}
