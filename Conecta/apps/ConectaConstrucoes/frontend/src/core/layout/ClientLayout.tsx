import { Outlet } from 'react-router-dom'
import TopBar from './TopBar'
import './ClientLayout.css'

export default function ClientLayout() {
  return (
    <div className="client-shell">
      <TopBar />
      <main className="client-content">
        <Outlet />
      </main>
    </div>
  )
}
