import { http } from '../../../core/api/http'

export interface CategoriaResponse {
  id: number
  nome: string
  slug: string
  descricao?: string
  iconeUrl?: string
  ativo: boolean
}

export interface PrestadorBuscaItemResponse {
  id: number
  usuarioId: number
  nome: string
  nomeFantasia?: string
  avatar: string
  capaUrl?: string
  profissao: string
  categoria: string
  avaliacao: number
  numAvaliacoes: number
  destaqueRegiao: boolean
  tipoBadge: 'verificado' | 'super' | string
  badgeTexto: string
  distanciaKm: number
  distanciaTexto: string
  precoHora: number
  precoTexto: string
  precoLabel: string
  statusDisponibilidade: string
  tags: string[]
  temChat: boolean
}

export interface PrestadorBuscaPaginadaResponse {
  itens: PrestadorBuscaItemResponse[]
  totalItens: number
  pagina: number
  tamanhoPagina: number
  totalPaginas: number
}

export interface FiltroBuscaParams {
  categoria?: string | null
  termo?: string | null
  lat?: number | null
  lng?: number | null
  raioKm?: number
  apenasDisponiveis?: boolean
  ordenacao?: string
  pagina?: number
  tamanhoPagina?: number
}

export const vitrineService = {
  async listarCategorias(): Promise<CategoriaResponse[]> {
    return await http<CategoriaResponse[]>('/categorias')
  },

  async buscarPrestadores(params: FiltroBuscaParams = {}): Promise<PrestadorBuscaPaginadaResponse> {
    const query = new URLSearchParams()
    if (params.categoria) query.append('categoria', params.categoria)
    if (params.termo) query.append('termo', params.termo)
    if (params.lat != null) query.append('lat', params.lat.toString())
    if (params.lng != null) query.append('lng', params.lng.toString())
    if (params.raioKm != null) query.append('raioKm', params.raioKm.toString())
    if (params.apenasDisponiveis) query.append('apenasDisponiveis', 'true')
    if (params.ordenacao) query.append('ordenacao', params.ordenacao)
    if (params.pagina != null) query.append('pagina', params.pagina.toString())
    if (params.tamanhoPagina != null) query.append('tamanhoPagina', params.tamanhoPagina.toString())

    const qs = query.toString()
    const path = qs ? `/prestadores/vitrine?${qs}` : '/prestadores/vitrine'
    return await http<PrestadorBuscaPaginadaResponse>(path)
  },
}
