import { Navigate, Route, Routes } from 'react-router-dom'
import Home from '../pages/Home'
import Busca from '../pages/Busca'
import PrestadorPerfil from '../pages/PrestadorPerfil'
import MeusPedidos from '../pages/MeusPedidos'
import PedidoDetalhe from '../pages/PedidoDetalhe'
import ChatPedido from '../pages/ChatPedido'
import ProDashboard from '../pages/pro/ProDashboard'
import ProAnaliseSolicitacao from '../pages/pro/ProAnaliseSolicitacao'
import ProPortfolio from '../pages/pro/ProPortfolio'
import Login from '../pages/Login'
import RequirePerfil from '../components/session/RequirePerfil'
import { PERFIL_INFO, useSession } from '../context/SessionContext'
import AdminLayout from '../core/layout/AdminLayout'
import AdminDashboard from '../pages/admin/AdminDashboard'
import UsuariosLista from '../pages/admin/UsuariosLista'
import UsuarioDetalhe from '../pages/admin/UsuarioDetalhe'
import UsuarioEditar from '../pages/admin/UsuarioEditar'
import UsuarioRoles from '../pages/admin/UsuarioRoles'
import DocumentosPendentes from '../pages/admin/DocumentosPendentes'
import Denuncias from '../pages/admin/Denuncias'

export default function AppRoutes() {
  const { perfilAtivo } = useSession()
  const fallback = perfilAtivo ? PERFIL_INFO[perfilAtivo].home : '/login'

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* ===== Perfil CLIENTE ===== */}
      <Route element={<RequirePerfil perfil="CLIENTE" />}>
        <Route path="/" element={<Home />} />
        <Route path="/inicio" element={<Home />} />
        <Route path="/busca" element={<Busca />} />
        <Route path="/pesquisa" element={<Busca />} />
        <Route path="/prestador/:id" element={<PrestadorPerfil />} />
        <Route path="/prestador" element={<PrestadorPerfil />} />
        <Route path="/pedidos" element={<MeusPedidos />} />
        <Route path="/meus-pedidos" element={<MeusPedidos />} />
        <Route path="/pedidos/:id" element={<PedidoDetalhe />} />
        <Route path="/pedido/:id" element={<PedidoDetalhe />} />
        <Route path="/chat/:id" element={<ChatPedido />} />
        <Route path="/chat" element={<ChatPedido />} />
      </Route>

      {/* ===== Perfil PRESTADOR (Conecta PRO) ===== */}
      <Route element={<RequirePerfil perfil="PRESTADOR" />}>
        <Route path="/pro" element={<ProDashboard />} />
        <Route path="/pro/dashboard" element={<ProDashboard />} />
        <Route path="/pro/solicitacao/:id" element={<ProAnaliseSolicitacao />} />
        <Route path="/pro/pedidos/:id/analisar" element={<ProAnaliseSolicitacao />} />
        <Route path="/pro/portfolio" element={<ProPortfolio />} />
      </Route>

      {/* ===== Perfil ADMIN ===== */}
      <Route element={<RequirePerfil perfil="ADMIN" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="usuarios" element={<UsuariosLista />} />
          <Route path="usuarios/:id" element={<UsuarioDetalhe />} />
          <Route path="usuarios/:id/editar" element={<UsuarioEditar />} />
          <Route path="usuarios/:id/roles" element={<UsuarioRoles />} />
          <Route path="documentos" element={<DocumentosPendentes />} />
          <Route path="denuncias" element={<Denuncias />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={fallback} replace />} />
    </Routes>
  )
}
