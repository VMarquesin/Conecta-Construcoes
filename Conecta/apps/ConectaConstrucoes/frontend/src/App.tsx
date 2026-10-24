import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from './core/components/Toast'
import { ChatProvider } from './context/ChatContext'
import GlobalMessengerWidget from './components/chat/GlobalMessengerWidget'
import AppRoutes from './routes'

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ChatProvider>
          <AppRoutes />
          <GlobalMessengerWidget />
        </ChatProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
