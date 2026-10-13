import { http } from '../../../core/api/http'
import type { AdminService } from './AdminService'
import type { Usuario } from '../types'

const qs = (o: Record<string, string | undefined>) => {
  const p = new URLSearchParams()
  Object.entries(o).forEach(([k, v]) => v && p.set(k, v))
  const s = p.toString()
  return s ? `?${s}` : ''
}
const json = (body: unknown) => ({ body: JSON.stringify(body) })

/** Rotas propostas para a CON_004 — ajustar aqui caso o backend defina outras. */
export const httpAdminService: AdminService = {
  resumo: () => http('/admin/resumo'),
  listarUsuarios: (f) => http(`/admin/usuarios${qs({ ...f })}`),
  obterUsuario: (id) => http(`/admin/usuarios/${id}`),
  atualizarUsuario: (id, d) => http<Usuario>(`/admin/usuarios/${id}`, { method: 'PUT', ...json(d) }),
  bloquearUsuario: (id, motivo) => http(`/admin/usuarios/${id}/bloqueio`, { method: 'POST', ...json({ motivo }) }),
  desbloquearUsuario: (id) => http(`/admin/usuarios/${id}/bloqueio`, { method: 'DELETE' }),
  listarRoles: () => http('/admin/roles'),
  atribuirRole: (u, r) => http(`/admin/usuarios/${u}/roles/${r}`, { method: 'PUT' }),
  removerRole: (u, r) => http(`/admin/usuarios/${u}/roles/${r}`, { method: 'DELETE' }),
  listarDocumentosPendentes: () => http('/admin/documentos?status=PENDENTE'),
  aprovarDocumento: (id) => http(`/admin/documentos/${id}/aprovacao`, { method: 'POST' }),
  rejeitarDocumento: (id, motivo) => http(`/admin/documentos/${id}/rejeicao`, { method: 'POST', ...json({ motivo }) }),
  listarDenuncias: () => http('/admin/denuncias'),
  moderarDenuncia: (id, acao, observacao) => http(`/admin/denuncias/${id}/moderacao`, { method: 'POST', ...json({ acao, observacao }) }),
}
