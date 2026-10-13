import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from './core/components/Toast'
import AppRoutes from './routes'

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
