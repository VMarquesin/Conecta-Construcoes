import { Navigate, Route, Routes } from 'react-router-dom'
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
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="usuarios" element={<UsuariosLista />} />
        <Route path="usuarios/:id" element={<UsuarioDetalhe />} />
        <Route path="usuarios/:id/editar" element={<UsuarioEditar />} />
        <Route path="usuarios/:id/roles" element={<UsuarioRoles />} />
        <Route path="documentos" element={<DocumentosPendentes />} />
        <Route path="denuncias" element={<Denuncias />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}
