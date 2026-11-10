import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { ToastContext, type ToastFn, type ToastTone } from '../hooks/useToast'
import './Toast.css'

type Toast = { id: number; text: string; tone: ToastTone }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([])

  const removeToast = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback((text: string, tone: ToastTone = 'ok') => {
    const id = Date.now() + Math.random()
    setItems((prev) => [...prev, { id, text, tone }])
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const toastValue = useMemo<ToastFn>(() => {
    const fn = (text: string, tone?: ToastTone) => push(text, tone)
    return Object.assign(fn, {
      success: (text: string) => push(text, 'success'),
      error: (text: string) => push(text, 'error'),
      info: (text: string) => push(text, 'info'),
      warning: (text: string) => push(text, 'warning'),
    })
  }, [push])

  const renderIcon = (tone: ToastTone) => {
    if (tone === 'error') {
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      )
    }
    if (tone === 'warning') {
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      )
    }
    if (tone === 'info') {
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      )
    }
    // 'ok' or 'success'
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    )
  }

  return (
    <ToastContext.Provider value={toastValue}>
      {children}
      <div className="toasts-container" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast-item ${t.tone}`}>
            <div className="toast-icon-wrap">
              {renderIcon(t.tone)}
            </div>
            <div className="toast-content">{t.text}</div>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => removeToast(t.id)}
              aria-label="Fechar notificação"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
