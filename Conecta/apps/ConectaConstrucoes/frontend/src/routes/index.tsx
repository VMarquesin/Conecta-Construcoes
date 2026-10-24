import { Navigate, Route, Routes } from 'react-router-dom'
import Home from '../pages/Home'
import Busca from '../pages/Busca'
import PrestadorPerfil from '../pages/PrestadorPerfil'
import MeusPedidos from '../pages/MeusPedidos'
import PedidoDetalhe from '../pages/PedidoDetalhe'
import ChatPedido from '../pages/ChatPedido'
import AdminLayout from '../core/layout/AdminLayout'
import AdminDashboard from '../pages/admin/AdminDashboard'
import UsuariosLista from '../pages/admin/UsuariosLista'
import UsuarioDetalhe from '../pages/admin/UsuarioDetalhe'
import UsuarioEditar from '../pages/admin/UsuarioEditar'
import UsuarioRoles from '../pages/admin/UsuarioRoles'
import DocumentosPendentes from '../pages/admin/DocumentosPendentes'
import Denuncias from '../pages/admin/Denuncias'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Tela inicial do usuário após login */}
      <Route path="/" element={<Home />} />
      <Route path="/inicio" element={<Home />} />

      {/* Tela de Busca e Listagem de Profissionais por Categoria */}
      <Route path="/busca" element={<Busca />} />
      <Route path="/pesquisa" element={<Busca />} />

      {/* Perfil do Prestador (Vitrine) */}
      <Route path="/prestador/:id" element={<PrestadorPerfil />} />
      <Route path="/prestador" element={<PrestadorPerfil />} />

      {/* Meus Pedidos */}
      <Route path="/pedidos" element={<MeusPedidos />} />
      <Route path="/meus-pedidos" element={<MeusPedidos />} />

      {/* Detalhes do Pedido */}
      <Route path="/pedidos/:id" element={<PedidoDetalhe />} />
      <Route path="/pedido/:id" element={<PedidoDetalhe />} />

      {/* Chat com o Prestador */}
      <Route path="/chat/:id" element={<ChatPedido />} />
      <Route path="/chat" element={<ChatPedido />} />

      {/* Módulo de Administração */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="usuarios" element={<UsuariosLista />} />
        <Route path="usuarios/:id" element={<UsuarioDetalhe />} />
        <Route path="usuarios/:id/editar" element={<UsuarioEditar />} />
        <Route path="usuarios/:id/roles" element={<UsuarioRoles />} />
        <Route path="documentos" element={<DocumentosPendentes />} />
        <Route path="denuncias" element={<Denuncias />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
