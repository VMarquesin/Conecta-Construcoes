import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../features/cliente/pages/LoginPage';
import CadastroClientePage from '../features/cliente/pages/CadastroClientePage';
import { ProtectedRoute } from './ProtectedRoute';

export function AppRoutes(): React.ReactNode {
  return (
    <Routes>
      {/* Rotas Públicas (Qualquer um acessa) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<CadastroClientePage />} />

      {/* Rotas Protegidas (Precisa estar logado) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin/dashboard" element={<p>Em breve</p>} />
        <Route path="/pedidos" element={<p>Em breve</p>} />
      </Route>

      {/* Rota Fallback: Digitou uma URL que não existe? Joga pro login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
