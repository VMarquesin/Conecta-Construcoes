import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './MeusPedidos.css'

import carlosAvatar from '../assets/avatars/carlos.jpg'
import marianaRochaAvatar from '../assets/avatars/mariana_rocha.jpg'
import robertoAvatar from '../assets/avatars/roberto.jpg'
import marianaCostaAvatar from '../assets/avatars/mariana.jpg'

interface Pedido {
  id: number
  prestadorId: number
  prestadorNome: string
  prestadorProfissao: string
  prestadorAvatar: string
  solicitadoEm: string
  status: 'pendente' | 'aceito' | 'concluido'
  statusTexto: string
  tituloServico: string
  descricaoServico: string
  valorLabel: string
  valorTexto: string
  valorIsPreco?: boolean
  statusDica: string
  dicaIcone: 'clock' | 'truck' | 'check' | 'calendar'
}

const PEDIDOS_INICIAIS: Pedido[] = [
  {
    id: 1,
    prestadorId: 1,
    prestadorNome: 'Carlos Silva',
    prestadorProfissao: 'Eletricista Residencial',
    prestadorAvatar: carlosAvatar,
    solicitadoEm: 'Hoje, 14:30',
    status: 'pendente',
    statusTexto: 'Pendente',
    tituloServico: 'Troca de fiação do chuveiro e disjuntores',
    descricaoServico:
      'Revisão do quadro de distribuição geral e substituição do cabeamento de 6mm com disjuntor bipolar de 32A.',
    valorLabel: 'Orçamento Estimado',
    valorTexto: 'R$ 180,00',
    valorIsPreco: true,
    statusDica: 'Aguardando resposta',
    dicaIcone: 'clock',
  },
  {
    id: 2,
    prestadorId: 3,
    prestadorNome: 'Mariana Rocha',
    prestadorProfissao: 'Encanadora Hidráulica',
    prestadorAvatar: marianaRochaAvatar,
    solicitadoEm: 'Ontem, 19:15',
    status: 'pendente',
    statusTexto: 'Pendente',
    tituloServico: 'Reparo emergencial de vazamento sob a pia',
    descricaoServico:
      'Sifão articulado apresentando gotejamento constante na bancada da cozinha, necessidade de troca da borracha de vedação.',
    valorLabel: 'Valor Previsto',
    valorTexto: 'A combinar',
    valorIsPreco: false,
    statusDica: 'Visita técnica grátis',
    dicaIcone: 'truck',
  },
  {
    id: 3,
    prestadorId: 5,
    prestadorNome: 'Roberto Mendes',
    prestadorProfissao: 'Encanador & Desentupimento',
    prestadorAvatar: robertoAvatar,
    solicitadoEm: '22 de Outubro',
    status: 'aceito',
    statusTexto: 'Aceito',
    tituloServico: 'Limpeza e desentupimento de tubulação principal',
    descricaoServico: 'Desobstrução do encanamento e verificação do fluxo da caixa de gordura.',
    valorLabel: 'Valor Fechado',
    valorTexto: 'R$ 220,00',
    valorIsPreco: true,
    statusDica: 'Agendado para amanhã, 10:00',
    dicaIcone: 'calendar',
  },
  {
    id: 4,
    prestadorId: 2,
    prestadorNome: 'Mariana Costa',
    prestadorProfissao: 'Pintora & Acabamentos',
    prestadorAvatar: marianaCostaAvatar,
    solicitadoEm: '18 de Outubro',
    status: 'concluido',
    statusTexto: 'Concluído',
    tituloServico: 'Pintura interna e reparos em drywall',
    descricaoServico: 'Pintura completa com duas demãos de tinta lavável e tratamento de trincas.',
    valorLabel: 'Valor Pago',
    valorTexto: 'R$ 450,00',
    valorIsPreco: true,
    statusDica: 'Serviço finalizado com garantia',
    dicaIcone: 'check',
  },
]

export default function MeusPedidos() {
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState<Pedido[]>(PEDIDOS_INICIAIS)
  const [abaAtiva, setAbaAtiva] = useState<'pendente' | 'aceito' | 'concluido'>('pendente')
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null)

  const numPendentes = pedidos.filter((p) => p.status === 'pendente').length
  const numAceitos = pedidos.filter((p) => p.status === 'aceito').length
  const numConcluidos = pedidos.filter((p) => p.status === 'concluido').length

  const pedidosFiltrados = pedidos.filter((p) => p.status === abaAtiva)

  const handleCancelar = (id: number, prestadorNome: string) => {
    if (confirm(`Deseja realmente cancelar o pedido com ${prestadorNome}?`)) {
      setPedidos((prev) => prev.filter((p) => p.id !== id))
    }
  }

  return (
    <div className="pedidos-viewport">
      <div className="pedidos-container">
        {/* Header Superior */}
        <header className="pedidos-header">
          <div className="pedidos-header-inner">
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

            {/* Desktop Navigation */}
            <nav className="desktop-nav">
              <Link to="/" className="desktop-nav-link">Início</Link>
              <Link to="/busca" className="desktop-nav-link">Buscar Serviços</Link>
              <Link to="/pedidos" className="desktop-nav-link active">Meus Pedidos</Link>
              <Link to="/admin" className="desktop-nav-link">Painel Admin</Link>
            </nav>

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

        {/* Conteúdo Principal */}
        <main className="pedidos-main">
          {/* Título e Ação de Ajuda */}
          <div className="pedidos-title-row">
            <div className="pedidos-titles">
              <h1 className="pedidos-page-title">Meus Pedidos</h1>
              <p className="pedidos-page-subtitle">Acompanhe seus serviços e orçamentos em tempo real</p>
            </div>

            <button
              className="pedidos-support-btn"
              title="Central de Ajuda e Suporte aos Pedidos"
              onClick={() => alert('Abrindo canal direto de suporte ao cliente...')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
            </button>
          </div>

          {/* Abas de Status do Pedido */}
          <div className="pedidos-tabs-bar">
            <button
              className={`tab-btn ${abaAtiva === 'pendente' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('pendente')}
            >
              <span>Pendentes</span>
              <span className="tab-badge amber">{numPendentes}</span>
            </button>

            <button
              className={`tab-btn ${abaAtiva === 'aceito' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('aceito')}
            >
              <span>Aceitos</span>
              <span className="tab-badge blue">{numAceitos}</span>
            </button>

            <button
              className={`tab-btn ${abaAtiva === 'concluido' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('concluido')}
            >
              <span>Concluídos</span>
              <span className="tab-badge green">{numConcluidos}</span>
            </button>
          </div>

          {/* Banner Garantia Conecta Protege */}
          <div className="pedidos-protege-banner">
            <div className="protege-blue-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
            </div>
            <div className="protege-banner-texts">
              <h4 className="protege-banner-title">Garantia Conecta Protege</h4>
              <p className="protege-banner-sub">
                Pagamento retido com total segurança até a finalização do serviço.
              </p>
            </div>
          </div>

          {/* Lista de Pedidos Filtrados */}
          <div className="pedidos-cards-grid">
            {pedidosFiltrados.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b', gridColumn: '1 / -1' }}>
                <h3>Nenhum pedido nesta categoria</h3>
                <p>Quando você solicitar novos orçamentos, eles aparecerão aqui.</p>
                <Link
                  to="/busca"
                  className="btn-detalhes-pedido"
                  style={{ display: 'inline-flex', marginTop: '14px', textDecoration: 'none', padding: '0 20px' }}
                >
                  Buscar Prestadores
                </Link>
              </div>
            ) : (
              pedidosFiltrados.map((pedido) => (
                <article key={pedido.id} className="pedido-card">
                  {/* Linha do Prestador */}
                  <div className="pedido-prof-header">
                    <div className="pedido-prof-left">
                      <div className="pedido-prof-avatar-wrap">
                        <img
                          src={pedido.prestadorAvatar}
                          alt={pedido.prestadorNome}
                          className="pedido-prof-avatar-img"
                        />
                        <span className="pedido-prof-check">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                      </div>

                      <div className="pedido-prof-info">
                        <h3 className="pedido-prof-name">
                          <span>{pedido.prestadorNome}</span>
                        </h3>
                        <p className="pedido-prof-service">{pedido.prestadorProfissao}</p>
                        <span className="pedido-prof-time">{pedido.solicitadoEm}</span>
                      </div>
                    </div>

                    <span
                      className={`pedido-status-pill ${
                        pedido.status === 'pendente'
                          ? 'status-pendente'
                          : pedido.status === 'aceito'
                          ? 'status-aceito'
                          : 'status-concluido'
                      }`}
                    >
                      {pedido.status === 'pendente' && '⏳ '}
                      {pedido.status === 'aceito' && '✓ '}
                      {pedido.status === 'concluido' && '★ '}
                      {pedido.statusTexto}
                    </span>
                  </div>

                  {/* Balão com Resumo do Serviço */}
                  <div className="pedido-details-bubble">
                    <h4 className="pedido-details-title">{pedido.tituloServico}</h4>
                    <p className="pedido-details-desc">{pedido.descricaoServico}</p>
                  </div>

                  {/* Preço e Dica de Status */}
                  <div className="pedido-price-row">
                    <div className="pedido-price-left">
                      <span className="pedido-price-hint">{pedido.valorLabel}</span>
                      <span className={`pedido-price-val ${!pedido.valorIsPreco ? 'neutral' : ''}`}>
                        {pedido.valorTexto}
                      </span>
                    </div>

                    <span className="pedido-status-hint">
                      {pedido.dicaIcone === 'clock' && (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      )}
                      {pedido.dicaIcone === 'truck' && (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="3" width="15" height="13" />
                          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                          <circle cx="5.5" cy="18.5" r="2.5" />
                          <circle cx="18.5" cy="18.5" r="2.5" />
                        </svg>
                      )}
                      {pedido.dicaIcone === 'calendar' && (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      )}
                      {pedido.dicaIcone === 'check' && (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      <span>{pedido.statusDica}</span>
                    </span>
                  </div>

                  {/* Ações do Card */}
                  <div className="pedido-card-actions">
                    <button
                      className="btn-cancelar-pedido"
                      onClick={() => handleCancelar(pedido.id, pedido.prestadorNome)}
                    >
                      Cancelar Pedido
                    </button>

                    <button
                      className="btn-detalhes-pedido"
                      onClick={() => setPedidoSelecionado(pedido)}
                    >
                      <span>Ver Detalhes</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </main>

        {/* Modal de Detalhes do Pedido */}
        {pedidoSelecionado && (
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
                maxWidth: '520px',
                width: '100%',
                padding: '28px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Detalhes do Pedido #{pedidoSelecionado.id}</h3>
                <button
                  onClick={() => setPedidoSelecionado(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', background: '#f8fafc', borderRadius: '14px' }}>
                <img
                  src={pedidoSelecionado.prestadorAvatar}
                  alt={pedidoSelecionado.prestadorNome}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>{pedidoSelecionado.prestadorNome}</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{pedidoSelecionado.prestadorProfissao}</p>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Serviço Solicitado</span>
                <h4 style={{ margin: '4px 0 6px', fontSize: '16px', fontWeight: 800 }}>{pedidoSelecionado.tituloServico}</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>
                  {pedidoSelecionado.descricaoServico}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px', background: '#eff6ff', borderRadius: '12px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{pedidoSelecionado.valorLabel}</span>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0056d6' }}>{pedidoSelecionado.valorTexto}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Status Atual</span>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{pedidoSelecionado.statusTexto}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  onClick={() => {
                    navigate(`/prestador/${pedidoSelecionado.prestadorId}`)
                    setPedidoSelecionado(null)
                  }}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Ver Perfil do Prestador
                </button>
                <button
                  onClick={() => {
                    alert(`Iniciando conversa com ${pedidoSelecionado.prestadorNome}...`)
                    setPedidoSelecionado(null)
                  }}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#0056d6',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Conversar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rodapé Desktop */}
        <footer className="home-desktop-footer">
          <div className="footer-inner">
            <span>© 2026 Conecta Construções - Todos os direitos reservados.</span>
            <div className="footer-links">
              <Link to="/">Início</Link>
              <Link to="/busca">Buscar Serviços</Link>
              <Link to="/pedidos">Meus Pedidos</Link>
              <Link to="/admin">Administração</Link>
            </div>
          </div>
        </footer>

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

          <Link to="/pedidos" className="nav-item active">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
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
