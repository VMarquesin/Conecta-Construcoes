import { http } from '../../../core/api/http'

export interface MensagemItemResponse {
  id: string
  remetente: 'usuario' | 'prestador'
  remetenteId?: number
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
  remetente?: string
  remetenteId?: number
}

export interface ConversaResponse {
  id: string
  conversaId: number
  prestadorId: number
  clienteId?: number
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
  async listarConversas(perfil?: string | null, usuarioId?: number): Promise<ConversaResponse[]> {
    const token =
      localStorage.getItem('conecta.token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('conecta_token') ||
      localStorage.getItem('conecta.jwt')

    // Trava de segurança (Guard Clause): só requisita se houver token
    if (!token) {
      return []
    }

    try {
      if (perfil === 'PRESTADOR' && usuarioId) {
        return await http<ConversaResponse[]>(`/conversas/prestador/${usuarioId}`)
      } else if (perfil === 'CLIENTE' && usuarioId) {
        return await http<ConversaResponse[]>(`/conversas/cliente/${usuarioId}`)
      }
      return await http<ConversaResponse[]>('/conversas')
    } catch {
      return []
    }
  },

  async obterConversa(id: number): Promise<ConversaResponse> {
    return await http<ConversaResponse>(`/conversas/${id}`)
  },

  async iniciarConversa(
    prestadorOuDados: number | { prestadorId?: number; clienteId?: number; pedidoId?: number },
    pedidoId?: number
  ): Promise<ConversaResponse> {
    const payload =
      typeof prestadorOuDados === 'number'
        ? { prestadorId: prestadorOuDados, pedidoId }
        : prestadorOuDados
    return await http<ConversaResponse>('/conversas/iniciar', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
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

  async marcarComoLida(conversaId: number): Promise<void> {
    try {
      await http<void>(`/conversas/${conversaId}/lidas`, { method: 'POST' })
    } catch {
      // Silencioso em caso de erro de rede
    }
  },
}
