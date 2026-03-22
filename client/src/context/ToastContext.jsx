import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const toneStyles = {
  success: 'border-emerald-500/40 bg-emerald-100 text-emerald-950 dark:bg-emerald-500/15 dark:text-emerald-100',
  error: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
  info: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
}

const toneIcons = {
  success: CheckCircle2,
  error: CircleAlert,
  info: Info,
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((toast) => {
    const id = crypto.randomUUID()
    const nextToast = {
      id,
      title: toast.title,
      message: toast.message || '',
      tone: toast.tone || 'info',
    }
    setToasts((current) => [...current, nextToast])
    window.setTimeout(() => {
      removeToast(id)
    }, toast.duration ?? 3500)
  }, [removeToast])

  const value = useMemo(() => ({ showToast, removeToast }), [showToast, removeToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-4">
        <div className="flex w-full max-w-md flex-col gap-3">
          {toasts.map((toast) => {
            const Icon = toneIcons[toast.tone] || Info
            return (
              <div
                key={toast.id}
                className={`pointer-events-auto flex items-start gap-3 rounded-[22px] border px-4 py-4 shadow-soft backdrop-blur-xl ${toneStyles[toast.tone]}`}
              >
                <Icon size={18} className="mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{toast.title}</p>
                  {toast.message ? <p className="mt-1 text-sm opacity-100">{toast.message}</p> : null}
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="rounded-full p-1 opacity-70 transition hover:opacity-100"
                  aria-label="Dismiss notification"
                >
                  <X size={14} />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
