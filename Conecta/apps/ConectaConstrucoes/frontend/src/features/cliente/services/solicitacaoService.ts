import { http } from '../../../core/api/http'

export interface PortfolioItemDto {
  id: number
  titulo: string
  subtitulo?: string
  imagem: string
}

export interface AvaliacaoItemDto {
  id: number
  nome: string
  nota: number
  data: string
  comentario: string
  iniciais: string
}

export interface PrestadorPerfilDetalhadoResponse {
  id: number
  nome: string
  profissao: string
  avatar: string
  capa: string
  bio: string
  experienciaAnos: number
  valorHora: number
  statusDisponibilidade: string
  tempoResposta: string
  avaliacao: number
  numAvaliacoes: number
  seloSuper: boolean
  verificado: boolean
  isFavorited: boolean
  cidade: string
  estado: string
  checklist: string[]
  portfolio: PortfolioItemDto[]
  avaliacoes: AvaliacaoItemDto[]
}

export interface CriarSolicitacaoRequest {
  prestadorId: number
  categoriaId?: number | null
  titulo: string
  descricao: string
  enderecoAtendimento?: string | null
  imagens?: string[]
}

export interface SolicitacaoResponse {
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

export const solicitacaoService = {
  async obterPerfilPrestador(id: number): Promise<PrestadorPerfilDetalhadoResponse> {
    return await http<PrestadorPerfilDetalhadoResponse>(`/prestadores/${id}`)
  },

  async alternarFavorito(prestadorId: number): Promise<{ favoritado: boolean; mensagem: string }> {
    return await http<{ favoritado: boolean; mensagem: string }>(`/prestadores/${prestadorId}/favorito`, {
      method: 'POST',
    })
  },

  async criarSolicitacao(dados: CriarSolicitacaoRequest, clienteId?: number): Promise<SolicitacaoResponse> {
    const qs = clienteId ? `?clienteId=${clienteId}` : ''
    return await http<SolicitacaoResponse>(`/solicitacoes${qs}`, {
      method: 'POST',
      body: JSON.stringify(dados),
    })
  },
}
