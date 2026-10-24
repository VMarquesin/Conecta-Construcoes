import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AccountTrigger from '../../components/session/AccountTrigger'
import './ProPortfolio.css'

import quadroImg from '../../assets/portfolio/quadro.jpg'
import pendentesImg from '../../assets/portfolio/pendentes.jpg'
import tomadaImg from '../../assets/portfolio/tomada.jpg'
import ledImg from '../../assets/portfolio/led.jpg'
import carlosAvatar from '../../assets/avatars/carlos.jpg'

interface FotoItem {
  id: string
  categoria: 'quadro' | 'iluminacao' | 'tomada' | 'ventilador'
  tagCategoria: string
  titulo: string
  detalhe: string
  imagemUrl: string
}

export default function ProPortfolio() {
  const navigate = useNavigate()

  const [abaFiltro, setAbaFiltro] = useState<'todos' | 'quadros' | 'iluminacao'>('todos')
  const [sobreMimTexto, setSobreMimTexto] = useState(
    'Eletricista residencial e predial com mais de 8 anos de experiência em Tupã. Especialista em montagem e manutenção de quadros elétricos de distribuição, troca de fiação de chuveiro, instalação de iluminação LED e projetos de automação residencial conforme normas técnicas NBR 5410.'
  )
  const [salvoFeedback, setSalvoFeedback] = useState(true)

  const [fotos, setFotos] = useState<FotoItem[]>([
    {
      id: 'f1',
      categoria: 'quadro',
      tagCategoria: 'Quadro Elétrico',
      titulo: 'Reforma completa quadro',
      detalhe: 'Bifásico • Centro',
      imagemUrl: quadroImg,
    },
    {
      id: 'f2',
      categoria: 'iluminacao',
      tagCategoria: 'Iluminação',
      titulo: 'Iluminação embutida',
      detalhe: 'LED e pendente • Jd. América',
      imagemUrl: pendentesImg,
    },
    {
      id: 'f3',
      categoria: 'tomada',
      tagCategoria: 'Tomadas 20A',
      titulo: 'Circuito 20A cozinha',
      detalhe: 'Norma NBR 5410 • Vila Nova',
      imagemUrl: tomadaImg,
    },
    {
      id: 'f4',
      categoria: 'iluminacao',
      tagCategoria: 'Ventilador de Teto',
      titulo: 'Ventilador inverter',
      detalhe: 'Silencioso • Centro',
      imagemUrl: ledImg,
    },
  ])

  const handleSalvarTexto = () => {
    setSalvoFeedback(true)
    alert('Texto de apresentação atualizado na sua vitrine pública!')
  }

  const handleExcluirFoto = (id: string, titulo: string) => {
    if (confirm(`Remover "${titulo}" do seu portfólio?`)) {
      setFotos((prev) => prev.filter((f) => f.id !== id))
    }
  }

  const handleAdicionarFoto = () => {
    const titulo = prompt('Título do trabalho realizado (ex: Instalação de lustre):')
    if (titulo) {
      const nova: FotoItem = {
        id: Date.now().toString(),
        categoria: 'iluminacao',
        tagCategoria: 'Novo Trabalho',
        titulo,
        detalhe: 'Recente • Tupã',
        imagemUrl: pendentesImg,
      }
      setFotos((prev) => [nova, ...prev])
    }
  }

  const fotosFiltradas = fotos.filter((f) => {
    if (abaFiltro === 'quadros') return f.categoria === 'quadro'
    if (abaFiltro === 'iluminacao') return f.categoria === 'iluminacao'
    return true
  })

  return (
    <div className="portfolio-viewport">
      {/* Top Header - Full width */}
      <header className="portfolio-header">
        <div className="portfolio-header-inner">
          <div className="portfolio-header-left">
            <button className="portfolio-back-btn" onClick={() => navigate('/pro')} title="Voltar ao Painel">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <h1 className="portfolio-header-title">Gestão de Portfólio</h1>
          </div>

          <AccountTrigger className="portfolio-user-avatar-wrap" title="Minha conta">
            <img src={carlosAvatar} alt="Carlos Silva" className="portfolio-header-avatar" />
          </AccountTrigger>
        </div>
      </header>

      <div className="portfolio-container">

        {/* Título da Seção + Botão Nova Foto */}
        <div className="portfolio-title-bar">
          <div>
            <h2 className="portfolio-title-main">Meu Portfólio</h2>
            <span className="portfolio-title-sub">Vitrine visível para clientes em Tupã</span>
          </div>

          <button className="btn-nova-foto" onClick={handleAdicionarFoto}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Nova Foto</span>
          </button>
        </div>

        {/* Banner de Impulso de Conversão */}
        <div className="portfolio-impulso-card">
          <div className="impulso-header-row">
            <div className="impulso-title-col">
              <span className="impulso-tag-destaque">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Impulso de Conversão
              </span>
              <strong className="impulso-mult-badge">Até 3x mais</strong>
            </div>
          </div>
          <p className="impulso-desc">
            Fotos de qualidade aumentam suas chances de fechar orçamentos na região.
          </p>
          <div className="impulso-footer-row">
            <div className="impulso-stats">
              <span>📷 <strong>{fotos.length} ativas</strong></span>
              <span className="dot-sep">•</span>
              <span>👁 <strong>182 visualizações/mês</strong></span>
            </div>
          </div>
        </div>

        {/* Seção Sobre Mim */}
        <div className="portfolio-section-card">
          <div className="section-card-header">
            <div className="section-title-wrap">
              <h3 className="section-card-title">Sobre mim</h3>
              <span className="badge-visivel-vitrine">Visível na vitrine</span>
            </div>
            <span className="char-counter">{sobreMimTexto.length} / 500</span>
          </div>

          <p className="section-card-hint">
            Conte sua experiência, certificados e especialidades em Tupã e região.
          </p>

          <textarea
            className="sobre-mim-textarea"
            rows={4}
            value={sobreMimTexto}
            maxLength={500}
            onChange={(e) => {
              setSobreMimTexto(e.target.value)
              setSalvoFeedback(false)
            }}
          />

          <div className="sobre-mim-footer-row">
            <div className="salvo-status">
              {salvoFeedback ? (
                <span className="salvo-ok">✓ Salvo recentemente</span>
              ) : (
                <span className="salvo-pendente">● Alterações não salvas</span>
              )}
            </div>

            <button className="btn-salvar-texto" onClick={handleSalvarTexto}>
              ✓ Salvar texto
            </button>
          </div>
        </div>

        {/* Seção Fotos dos seus Serviços */}
        <div className="portfolio-section-card">
          <div className="section-card-header">
            <div>
              <h3 className="section-card-title">Fotos dos seus Serviços</h3>
              <p className="section-card-hint" style={{ margin: '2px 0 0 0' }}>
                Trabalhos reais comprovam sua competência
              </p>
            </div>
            <span className="badge-fotos-count">{fotos.length} / 12 fotos</span>
          </div>

          {/* Filtros em Pílulas */}
          <div className="fotos-filter-tabs">
            <button
              className={`foto-tab-btn ${abaFiltro === 'todos' ? 'active' : ''}`}
              onClick={() => setAbaFiltro('todos')}
            >
              Todos ({fotos.length})
            </button>
            <button
              className={`foto-tab-btn ${abaFiltro === 'quadros' ? 'active' : ''}`}
              onClick={() => setAbaFiltro('quadros')}
            >
              Quadros Elétricos (1)
            </button>
            <button
              className={`foto-tab-btn ${abaFiltro === 'iluminacao' ? 'active' : ''}`}
              onClick={() => setAbaFiltro('iluminacao')}
            >
              Iluminação (2)
            </button>
          </div>

          {/* Grid de Fotos */}
          <div className="portfolio-photos-grid">
            {fotosFiltradas.map((foto) => (
              <div key={foto.id} className="photo-card-item">
                <div className="photo-img-wrap">
                  <img src={foto.imagemUrl} alt={foto.titulo} className="photo-img" />
                  <span className="photo-tag-overlay">{foto.tagCategoria}</span>
                  <button
                    className="photo-delete-btn"
                    onClick={() => handleExcluirFoto(foto.id, foto.titulo)}
                    title="Excluir foto"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
                <div className="photo-info-footer">
                  <h4 className="photo-title">{foto.titulo}</h4>
                  <span className="photo-detail">{foto.detalhe}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Card Tracejado para Upload */}
          <div className="upload-dashed-card" onClick={handleAdicionarFoto}>
            <div className="upload-icon-circle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0056D6" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <strong className="upload-title">Adicionar Foto ao Portfólio</strong>
            <span className="upload-sub">PNG, JPG até 10 MB (máx. 12 imagens)</span>
          </div>
        </div>

        {/* Card Dica Conecta Pro: Mostre seu talento! */}
        <div className="portfolio-tip-card">
          <div className="tip-pro-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.2">
              <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z" />
            </svg>
          </div>
          <div className="tip-pro-content">
            <strong className="tip-pro-title">Dica Conecta Pro: Mostre seu talento!</strong>
            <p className="tip-pro-desc">
              Clientes com fotos reais no portfólio fecham até <strong>3x mais serviços</strong>. Adicione fotos nítidas do antes e depois dos seus trabalhos para transmitir máxima credibilidade em Tupã.
            </p>
            <div className="tip-pro-tags">
              <span className="tip-tag">☼ Boa iluminação</span>
              <span className="tip-tag">🧺 Ambiente organizado</span>
            </div>
          </div>
        </div>

        {/* Barra de Navegação Inferior (Mobile Viewport) */}
        <nav className="pro-bottom-nav">
          <Link to="/pro" className="pro-bottom-item">
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
            onClick={() => alert('Abrindo agenda...')}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Agenda</span>
          </button>

          <Link to="/pro/portfolio" className="pro-bottom-item active">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            <span>Portfólio</span>
          </Link>

          <AccountTrigger className="pro-bottom-item" title="Minha conta">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Perfil Pro</span>
          </AccountTrigger>
        </nav>
      </div>
    </div>
  )
}
