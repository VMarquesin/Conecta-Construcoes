import { useCallback, useState, type ReactNode } from 'react'
import { ToastContext, type ToastTone } from '../hooks/useToast'

type Toast = { id: number; text: string; tone: ToastTone }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([])
  const push = useCallback((text: string, tone: ToastTone = 'ok') => {
    const id = Date.now() + Math.random()
    setItems((p) => [...p, { id, text, tone }])
    setTimeout(() => setItems((p) => p.filter((t) => t.id !== id)), 3500)
  }, [])

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="toasts" aria-live="polite">
        {items.map((t) => <div key={t.id} className={`toast ${t.tone}`}>{t.text}</div>)}
      </div>
    </ToastContext.Provider>
  )
}
