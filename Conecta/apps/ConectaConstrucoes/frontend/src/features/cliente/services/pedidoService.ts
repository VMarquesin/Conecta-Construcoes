import { http } from '../../../core/api/http'

export interface PedidoResumoResponse {
  id: number
  prestadorId: number
  prestadorNome: string
  prestadorProfissao: string
  prestadorAvatar: string
  solicitadoEm: string
  status: 'pendente' | 'aceito' | 'concluido' | string
  statusTexto: string
  tituloServico: string
  descricaoServico: string
  valorLabel: string
  valorTexto: string
  valorIsPreco?: boolean
  statusDica: string
  dicaIcone: 'clock' | 'truck' | 'check' | 'calendar' | string
}

export interface ItemPropostaResponse {
  id: number
  descricao: string
  valor: number
  quantidade: number
}

export interface PropostaResponse {
  id: number
  solicitacaoId: number
  prestadorId: number
  valorTotal: number
  prazoDias: number
  descricao?: string
  status: string
  criadoEm: string
  itens: ItemPropostaResponse[]
}

export interface PedidoDetalheResponse {
  id: number
  clienteId: number
  clienteNome: string
  prestadorId: number
  prestadorNome: string
  prestadorProfissao: string
  prestadorAvatar: string
  prestadorNota?: number
  prestadorTotalAvaliacoes?: number
  fotoUrl?: string
  tituloServico: string
  descricaoServico: string
  status: string
  statusTexto: string
  valorCombinado?: number
  valorFinal?: number
  dataCriacao: string
  agendadoPara?: string
  concluidoEm?: string
  enderecoAtendimento?: string
  proposta?: PropostaResponse | null
  podeAvaliar: boolean
  jaAvaliado: boolean
}

export const pedidoService = {
  async listarMeusPedidos(status?: string | null, clienteId?: number): Promise<PedidoResumoResponse[]> {
    const query = new URLSearchParams()
    if (status) query.append('status', status)
    if (clienteId) query.append('clienteId', clienteId.toString())

    const qs = query.toString()
    const path = qs ? `/pedidos/meus?${qs}` : '/pedidos/meus'
    return await http<PedidoResumoResponse[]>(path)
  },

  async obterDetalhesPedido(id: number, clienteId?: number): Promise<PedidoDetalheResponse> {
    const qs = clienteId ? `?clienteId=${clienteId}` : ''
    return await http<PedidoDetalheResponse>(`/pedidos/${id}${qs}`)
  },

  async cancelarPedido(id: number): Promise<void> {
    return await http<void>(`/pedidos/${id}/cancelar`, { method: 'POST' })
  },

  async confirmarPagamento(id: number, metodo: string, parcelas: number = 1): Promise<void> {
    return await http<void>(`/pedidos/${id}/pagamento`, {
      method: 'POST',
      body: JSON.stringify({ formaPagamento: metodo, parcelas }),
    })
  },
}
