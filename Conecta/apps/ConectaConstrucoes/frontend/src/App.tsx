import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from './core/components/Toast'
import { ChatProvider } from './context/ChatContext'
import { SessionProvider, useSession } from './context/SessionContext'
import GlobalMessengerWidget from './components/chat/GlobalMessengerWidget'
import AccountMenu from './components/session/AccountMenu'
import AppRoutes from './routes'

function AppShell() {
  const { usuario } = useSession()
  return (
    <>
      <AppRoutes />
      {usuario && <GlobalMessengerWidget />}
      <AccountMenu />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <SessionProvider>
          <ChatProvider>
            <AppShell />
          </ChatProvider>
        </SessionProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
