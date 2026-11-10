import { http } from '../../../core/api/http'

export interface CriarAvaliacaoPayload {
  prestadorId?: number
  pedidoId?: number
  nota: number
  comentario?: string
}

export interface AtualizarAvaliacaoPayload {
  nota: number
  comentario?: string
}

export interface AvaliacaoResponse {
  id: number
  pedidoId: number
  clienteId: number
  clienteNome: string
  prestadorId: number
  nota: number
  comentario?: string
  dataCriacao: string
}

export const avaliacaoService = {
  async criarAvaliacao(payload: CriarAvaliacaoPayload): Promise<AvaliacaoResponse> {
    return await http<AvaliacaoResponse>('/avaliacoes', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async atualizarAvaliacao(id: number, payload: AtualizarAvaliacaoPayload): Promise<AvaliacaoResponse> {
    return await http<AvaliacaoResponse>(`/avaliacoes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },

  async removerAvaliacao(id: number): Promise<{ mensagem: string }> {
    return await http<{ mensagem: string }>(`/avaliacoes/${id}`, {
      method: 'DELETE',
    })
  },

  async listarPorPrestador(prestadorId: number): Promise<AvaliacaoResponse[]> {
    return await http<AvaliacaoResponse[]>(`/avaliacoes/prestador/${prestadorId}`)
  },
}
