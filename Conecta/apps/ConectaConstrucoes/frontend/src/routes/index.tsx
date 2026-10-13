import { Route, Routes } from 'react-router-dom'
import Home from '../pages/Home'
import Busca from '../pages/Busca'
import MeusPedidos from '../pages/MeusPedidos'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/busca" element={<Busca />} />
      <Route path="/pedidos" element={<MeusPedidos />} />
    </Routes>
  )
}
