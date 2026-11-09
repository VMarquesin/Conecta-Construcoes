import { http } from '../../../core/api/http'

export interface ProMetricasSemanaDto {
  pedidosAguardando: number
  avaliacaoMedia: number
  totalAvaliacoes: number
  ganhosSemana: number
}

export interface ProSolicitacaoPendenteDto {
  id: string
  clienteNome: string
  clienteAvatar: string
  tempoRelativo: string
  localTexto: string
  tags: string[]
  isUrgente: boolean
  descricao: string
}

export interface ProDashboardResponse {
  nome: string
  profissao: string
  avatar: string
  disponivel: boolean
  raioAtendimentoKm: number
  cidade: string
  metricasSemana: ProMetricasSemanaDto
  pedidosPendentes: ProSolicitacaoPendenteDto[]
}

export interface ProEstatisticasResponse {
  usuarioId: number
  nome: string
  totalPedidos: number
  totalAvaliacoes: number
  mediaAvaliacoes: number
  totalServicosRealizados: number
}

export interface PedidoAgendaDto {
  id: number
  prestadorId?: number
  prestadorNome: string
  prestadorProfissao?: string
  prestadorAvatar?: string
  solicitadoEm?: string
  status: string
  statusTexto?: string
  tituloServico: string
  descricaoServico?: string
  valorLabel?: string
  valorTexto?: string
  valorIsPreco?: boolean
  statusDica?: string
  dicaIcone?: string
}

export interface SolicitacaoDetalheResponse {
  id: number
  clienteId: number
  clienteNome: string
  prestadorId: number
  prestadorNome: string
  titulo: string
  descricao: string
  status: string
  enderecoAtendimento?: string
  criadoEm: string
  imagens: string[]
}

export interface ItemPropostaRequest {
  descricao: string
  valor: number
  quantidade?: number
}

export interface EnviarPropostaRequest {
  valorTotal: number
  prazoDias?: number
  descricao?: string
  itens?: ItemPropostaRequest[]
}

export interface PropostaResponse {
  id: number
  solicitacaoId: number
  prestadorId: number
  valorTotal: number
  prazoDias?: number
  descricao?: string
  status: string
  criadoEm: string
}

export interface FotoPortfolioDto {
  id: string
  categoria: string
  tagCategoria: string
  titulo: string
  detalhe: string
  imagemUrl: string
}

export interface CriarItemPortfolioRequest {
  titulo: string
  categoria?: string
  tagCategoria?: string
  detalhe?: string
  imagemUrl: string
}

export const proService = {
  async obterDashboard(prestadorId?: number): Promise<ProDashboardResponse> {
    const qs = prestadorId ? `?prestadorId=${prestadorId}` : ''
    return await http<ProDashboardResponse>(`/pro/dashboard${qs}`)
  },

  async obterEstatisticas(prestadorId?: number): Promise<ProEstatisticasResponse> {
    const qs = prestadorId ? `?prestadorId=${prestadorId}` : ''
    return await http<ProEstatisticasResponse>(`/pro/dashboard/estatisticas${qs}`)
  },

  async listarSolicitacoes(prestadorId?: number): Promise<ProSolicitacaoPendenteDto[]> {
    const qs = prestadorId ? `?prestadorId=${prestadorId}` : ''
    return await http<ProSolicitacaoPendenteDto[]>(`/pro/solicitacoes${qs}`)
  },

  async listarAgenda(prestadorId?: number): Promise<PedidoAgendaDto[]> {
    const qs = prestadorId ? `?prestadorId=${prestadorId}` : ''
    return await http<PedidoAgendaDto[]>(`/pro/agenda${qs}`)
  },

  async atualizarDisponibilidade(status: 'DISPONIVEL' | 'OCUPADO', prestadorId?: number): Promise<void> {
    const qs = prestadorId ? `?prestadorId=${prestadorId}` : ''
    await http<void>(`/pro/disponibilidade${qs}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },

  async obterSolicitacao(id: number): Promise<SolicitacaoDetalheResponse> {
    return await http<SolicitacaoDetalheResponse>(`/solicitacoes/${id}`)
  },

  async enviarProposta(id: number, dados: EnviarPropostaRequest, prestadorId?: number): Promise<PropostaResponse> {
    const qs = prestadorId ? `?prestadorId=${prestadorId}` : ''
    return await http<PropostaResponse>(`/solicitacoes/${id}/propostas${qs}`, {
      method: 'POST',
      body: JSON.stringify(dados),
    })
  },

  async recusarSolicitacao(id: number, prestadorId?: number): Promise<void> {
    const qs = prestadorId ? `?prestadorId=${prestadorId}` : ''
    await http<void>(`/solicitacoes/${id}/recusar${qs}`, {
      method: 'POST',
    })
  },

  async obterMeuPortfolio(prestadorId?: number): Promise<FotoPortfolioDto[]> {
    const qs = prestadorId ? `?prestadorId=${prestadorId}` : ''
    return await http<FotoPortfolioDto[]>(`/prestadores/meu-portfolio${qs}`)
  },

  async adicionarFotoPortfolio(item: CriarItemPortfolioRequest, prestadorId?: number): Promise<FotoPortfolioDto> {
    const qs = prestadorId ? `?prestadorId=${prestadorId}` : ''
    return await http<FotoPortfolioDto>(`/prestadores/portfolio${qs}`, {
      method: 'POST',
      body: JSON.stringify(item),
    })
  },

  async removerFotoPortfolio(id: number, prestadorId?: number): Promise<void> {
    const qs = prestadorId ? `?prestadorId=${prestadorId}` : ''
    await http<void>(`/prestadores/portfolio/${id}${qs}`, {
      method: 'DELETE',
    })
  },

  async atualizarBio(bio: string, prestadorId?: number): Promise<void> {
    const qs = prestadorId ? `?prestadorId=${prestadorId}` : ''
    await http<void>(`/pro/bio${qs}`, {
      method: 'PUT',
      body: JSON.stringify({ bio }),
    })
  },
}
