import { Outlet } from 'react-router-dom'
import TopBar from './TopBar'
import './ProLayout.css'

export default function ProLayout() {
  return (
    <div className="pro-shell">
      <TopBar />
      <main className="pro-shell-content">
        <Outlet />
      </main>
    </div>
  )
}
