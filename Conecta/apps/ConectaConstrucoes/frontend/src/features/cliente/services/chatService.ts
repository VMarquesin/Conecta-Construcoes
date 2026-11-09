import { http } from '../../../core/api/http'

export interface MensagemItemResponse {
  id: string
  remetente: 'usuario' | 'prestador'
  texto?: string
  imagemUrl?: string
  imagemLegenda?: string
  hora: string
  status?: string
  isProposta?: boolean
}

export interface EnviarMensagemRequest {
  texto?: string
  imagemUrl?: string
  imagemLegenda?: string
}

export interface ConversaResponse {
  id: string
  conversaId: number
  prestadorId: number
  nome: string
  profissao: string
  avatar?: string
  online?: boolean
  statusTexto?: string
  naoLida?: boolean
  ultimaMensagem?: string
  tempo?: string
  pedidoNumero?: string
  mensagens?: MensagemItemResponse[]
}

export const chatService = {
  async listarConversas(): Promise<ConversaResponse[]> {
    try {
      return await http<ConversaResponse[]>('/conversas')
    } catch {
      return []
    }
  },

  async listarMensagens(pedidoOuConversaId: number, usuarioId?: number): Promise<MensagemItemResponse[]> {
    const qs = usuarioId ? `?usuarioId=${usuarioId}` : ''
    return await http<MensagemItemResponse[]>(`/conversas/${pedidoOuConversaId}/mensagens${qs}`)
  },

  async enviarMensagem(
    pedidoOuConversaId: number,
    request: EnviarMensagemRequest,
    usuarioId?: number
  ): Promise<MensagemItemResponse> {
    const qs = usuarioId ? `?usuarioId=${usuarioId}` : ''
    return await http<MensagemItemResponse>(`/conversas/${pedidoOuConversaId}/mensagens${qs}`, {
      method: 'POST',
      body: JSON.stringify(request),
    })
  },
}
