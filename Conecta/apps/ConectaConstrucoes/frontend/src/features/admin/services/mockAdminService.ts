import type { AdminService } from './AdminService'
import type { Denuncia, Documento, Role, StatusUsuario, TipoUsuario, Usuario } from '../types'

const wait = <T,>(v: T) => new Promise<T>((r) => setTimeout(() => r(structuredClone(v)), 250))
const d = (diasAtras: number) => new Date(Date.now() - diasAtras * 864e5).toISOString()

const roles: Role[] = [
  { id: 'admin', nome: 'Administrador', descricao: 'Acesso total ao sistema', permissoes: ['usuarios:ler', 'usuarios:editar', 'usuarios:bloquear', 'roles:gerenciar', 'documentos:analisar', 'denuncias:moderar'] },
  { id: 'moderador', nome: 'Moderador', descricao: 'Analisa documentos e denúncias', permissoes: ['usuarios:ler', 'documentos:analisar', 'denuncias:moderar'] },
  { id: 'prestador', nome: 'Prestador', descricao: 'Oferece serviços e responde pedidos', permissoes: ['portfolio:gerenciar', 'pedidos:responder'] },
  { id: 'cliente', nome: 'Cliente', descricao: 'Solicita serviços e avalia prestadores', permissoes: ['pedidos:criar', 'avaliacoes:criar'] },
  { id: 'suporte', nome: 'Suporte', descricao: 'Consulta usuários para atendimento', permissoes: ['usuarios:ler'] },
]

const nomes = ['Matheus Oliveira', 'Ana Beatriz Souza', 'Carlos Henrique Lima', 'Fernanda Alves', 'João Pedro Ramos', 'Luciana Prado', 'Rafael Mendes', 'Patrícia Gomes', 'Bruno Carvalho', 'Camila Nogueira', 'Diego Martins', 'Elaine Ferreira']
const tipos: TipoUsuario[] = ['CLIENTE', 'PRESTADOR', 'CLIENTE', 'PRESTADOR', 'CLIENTE', 'ADMIN']
const status: StatusUsuario[] = ['ATIVO', 'ATIVO', 'PENDENTE', 'ATIVO', 'BLOQUEADO']

let usuarios: Usuario[] = nomes.map((nome, i) => {
  const tipo = tipos[i % tipos.length]
  return {
    id: `u${i + 1}`,
    nome,
    email: `${nome.toLowerCase().normalize('NFD').replace(/[^a-z ]/g, '').replace(/ /g, '.')}@exemplo.com`,
    telefone: `(14) 99${String(100 + i * 37).padStart(3, '0')}-${String(1000 + i * 211).slice(0, 4)}`,
    cidade: 'Tupã - SP',
    tipo,
    status: tipo === 'ADMIN' ? 'ATIVO' : status[i % status.length],
    criadoEm: d(i * 9 + 2),
    roles: [tipo === 'ADMIN' ? 'admin' : tipo === 'PRESTADOR' ? 'prestador' : 'cliente'],
  }
})

let documentos: Documento[] = [
  { id: 'd1', usuarioId: 'u2', usuarioNome: 'Ana Beatriz Souza', tipoUsuario: 'PRESTADOR', tipoDocumento: 'CNH', enviadoEm: d(1), status: 'PENDENTE' },
  { id: 'd2', usuarioId: 'u4', usuarioNome: 'Fernanda Alves', tipoUsuario: 'PRESTADOR', tipoDocumento: 'Comprovante de CREA/CAU', enviadoEm: d(2), status: 'PENDENTE' },
  { id: 'd3', usuarioId: 'u3', usuarioNome: 'Carlos Henrique Lima', tipoUsuario: 'CLIENTE', tipoDocumento: 'Comprovante de residência', enviadoEm: d(3), status: 'PENDENTE' },
  { id: 'd4', usuarioId: 'u1', usuarioNome: 'Matheus Oliveira', tipoUsuario: 'CLIENTE', tipoDocumento: 'RG', enviadoEm: d(4), status: 'PENDENTE' },
]

const denuncias: Denuncia[] = [
  { id: 'n1', denuncianteNome: 'Matheus Oliveira', denunciadoId: 'u4', denunciadoNome: 'Fernanda Alves', motivo: 'Serviço não concluído', descricao: 'Recebeu o sinal e não compareceu na data combinada.', criadaEm: d(1), status: 'ABERTA' },
  { id: 'n2', denuncianteNome: 'Luciana Prado', denunciadoId: 'u2', denunciadoNome: 'Ana Beatriz Souza', motivo: 'Conduta inadequada', descricao: 'Mensagens ofensivas no chat do pedido.', criadaEm: d(3), status: 'EM_ANALISE' },
  { id: 'n3', denuncianteNome: 'Rafael Mendes', denunciadoId: 'u9', denunciadoNome: 'Bruno Carvalho', motivo: 'Perfil falso', descricao: 'Fotos do portfólio pertencem a outra empresa.', criadaEm: d(6), status: 'ABERTA' },
]

const buscar = (id: string) => {
  const u = usuarios.find((x) => x.id === id)
  if (!u) throw new Error('Usuário não encontrado')
  return u
}

export const mockAdminService: AdminService = {
  resumo: () =>
    wait({
      totalUsuarios: usuarios.length,
      prestadores: usuarios.filter((u) => u.tipo === 'PRESTADOR').length,
      clientes: usuarios.filter((u) => u.tipo === 'CLIENTE').length,
      bloqueados: usuarios.filter((u) => u.status === 'BLOQUEADO').length,
      documentosPendentes: documentos.filter((x) => x.status === 'PENDENTE').length,
      denunciasAbertas: denuncias.filter((x) => x.status === 'ABERTA' || x.status === 'EM_ANALISE').length,
    }),

  listarUsuarios: (f) => {
    const b = f.busca?.toLowerCase().trim()
    const lista = usuarios.filter((u) =>
      (!b || u.nome.toLowerCase().includes(b) || u.email.includes(b)) &&
      (!f.tipo || u.tipo === f.tipo) &&
      (!f.status || u.status === f.status) &&
      (!f.de || u.criadoEm.slice(0, 10) >= f.de) &&
      (!f.ate || u.criadoEm.slice(0, 10) <= f.ate))
    return wait(lista.sort((a, c) => c.criadoEm.localeCompare(a.criadoEm)))
  },
  obterUsuario: (id) => wait(buscar(id)),
  atualizarUsuario: (id, dados) => { Object.assign(buscar(id), dados); return wait(buscar(id)) },
  bloquearUsuario: (id) => { buscar(id).status = 'BLOQUEADO'; return wait(buscar(id)) },
  desbloquearUsuario: (id) => { buscar(id).status = 'ATIVO'; return wait(buscar(id)) },

  listarRoles: () => wait(roles),
  atribuirRole: (uid, rid) => { const u = buscar(uid); if (!u.roles.includes(rid)) u.roles.push(rid); return wait(u) },
  removerRole: (uid, rid) => { const u = buscar(uid); u.roles = u.roles.filter((r) => r !== rid); return wait(u) },

  listarDocumentosPendentes: () => wait(documentos.filter((x) => x.status === 'PENDENTE')),
  aprovarDocumento: (id) => { documentos = documentos.map((x) => (x.id === id ? { ...x, status: 'APROVADO' } : x)); return wait(undefined) },
  rejeitarDocumento: (id, motivo) => { documentos = documentos.map((x) => (x.id === id ? { ...x, status: 'REJEITADO', motivoRejeicao: motivo } : x)); return wait(undefined) },

  listarDenuncias: () => wait(denuncias),
  moderarDenuncia: (id, acao) => {
    const n = denuncias.find((x) => x.id === id)!
    n.acaoTomada = acao
    n.status = acao === 'ARQUIVAR' ? 'IMPROCEDENTE' : 'PROCEDENTE'
    if (acao === 'BLOQUEAR_USUARIO') usuarios = usuarios.map((u) => (u.id === n.denunciadoId ? { ...u, status: 'BLOQUEADO' } : u))
    return wait(n)
  },
}
