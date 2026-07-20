'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useCallback, Suspense } from 'react'
import { Check, AlertCircle, Loader2, X } from 'lucide-react'

type CancelState = 'confirm' | 'cancelling' | 'success' | 'error' | 'not-found'

const CANCEL_COPY = {
  en: {
    invalidTitle: 'Invalid Link',
    invalidBody: 'This cancellation link is invalid or expired.',
    successTitle: 'Session Cancelled',
    successBody:
      'Your session has been cancelled successfully. You will receive a confirmation email shortly.',
    bookNew: 'Book a New Session',
    notFoundTitle: 'Not Found',
    notFoundBody: 'This booking was not found or has already been cancelled.',
    errorTitle: 'Something Went Wrong',
    genericError: 'Something went wrong.',
    connectError: 'Unable to connect. Please try again.',
    tryAgain: 'Try Again',
    contactUs: 'Contact Us',
    cancellingText: 'Cancelling your session...',
    confirmTitle: 'Cancel Your Session?',
    confirmBody:
      'Are you sure you want to cancel this session? This action cannot be undone.',
    yesCancel: 'Yes, Cancel Session',
    keepSession: 'Keep My Session',
    backToSite: 'Back to syntra.build',
  },
  es: {
    invalidTitle: 'Enlace Invalido',
    invalidBody: 'Este enlace de cancelacion es invalido o ha expirado.',
    successTitle: 'Sesion Cancelada',
    successBody:
      'Tu sesion ha sido cancelada exitosamente. Recibiras un correo de confirmacion en breve.',
    bookNew: 'Reservar Nueva Sesion',
    notFoundTitle: 'No Encontrado',
    notFoundBody: 'Esta reserva no fue encontrada o ya ha sido cancelada.',
    errorTitle: 'Algo Salio Mal',
    genericError: 'Algo salio mal.',
    connectError: 'No se pudo conectar. Intenta de nuevo.',
    tryAgain: 'Intentar de Nuevo',
    contactUs: 'Contactanos',
    cancellingText: 'Cancelando tu sesion...',
    confirmTitle: 'Cancelar Tu Sesion?',
    confirmBody:
      'Estas seguro de que deseas cancelar esta sesion? Esta accion no se puede deshacer.',
    yesCancel: 'Si, Cancelar Sesion',
    keepSession: 'Mantener Mi Sesion',
    backToSite: 'Volver a syntra.build',
  },
} as const

function CancelContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const status = searchParams.get('status')
  const lang = searchParams.get('lang') === 'es' ? 'es' : 'en'
  const t = CANCEL_COPY[lang]

  const [state, setState] = useState<CancelState>(
    status === 'success' ? 'success' : 'confirm'
  )
  const [errorMessage, setErrorMessage] = useState('')

  const handleCancel = useCallback(async () => {
    if (!token) return
    setState('cancelling')

    try {
      const res = await fetch(`/api/booking/cancel?token=${token}`)
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 404) {
          setState('not-found')
        } else {
          setErrorMessage(data.message || t.genericError)
          setState('error')
        }
        return
      }

      setState('success')
    } catch {
      setErrorMessage(t.connectError)
      setState('error')
    }
  }, [token, t])

  if (!token) {
    return (
      <Card>
        <StatusIcon variant="error" />
        <h1 className="text-lg font-semibold text-foreground">{t.invalidTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.invalidBody}</p>
        <HomeLink label={t.backToSite} />
      </Card>
    )
  }

  if (state === 'success') {
    return (
      <Card>
        <StatusIcon variant="success" />
        <h1 className="text-lg font-semibold text-foreground">{t.successTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.successBody}</p>
        <a
          href="/"
          className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {t.bookNew}
        </a>
      </Card>
    )
  }

  if (state === 'not-found') {
    return (
      <Card>
        <StatusIcon variant="warning" />
        <h1 className="text-lg font-semibold text-foreground">{t.notFoundTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.notFoundBody}</p>
        <HomeLink label={t.backToSite} />
      </Card>
    )
  }

  if (state === 'error') {
    return (
      <Card>
        <StatusIcon variant="error" />
        <h1 className="text-lg font-semibold text-foreground">{t.errorTitle}</h1>
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleCancel}
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t.tryAgain}
          </button>
          <a
            href="mailto:hello@syntra.build"
            className="inline-flex h-9 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            {t.contactUs}
          </a>
        </div>
      </Card>
    )
  }

  if (state === 'cancelling') {
    return (
      <Card>
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t.cancellingText}</p>
      </Card>
    )
  }

  // Confirm state
  return (
    <Card>
      <StatusIcon variant="warning" />
      <h1 className="text-lg font-semibold text-foreground">{t.confirmTitle}</h1>
      <p className="text-sm text-muted-foreground">{t.confirmBody}</p>
      <div className="mt-4 flex gap-3">
        <button
          onClick={handleCancel}
          className="inline-flex h-9 items-center justify-center rounded-md bg-destructive px-4 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
        >
          {t.yesCancel}
        </button>
        <a
          href="/"
          className="inline-flex h-9 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          {t.keepSession}
        </a>
      </div>
    </Card>
  )
}

export default function CancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Suspense
        fallback={
          <Card>
            <Loader2 className="size-8 animate-spin text-primary" />
          </Card>
        }
      >
        <CancelContent />
      </Suspense>
    </div>
  )
}

// --- UI Helpers ---

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-xl border border-border bg-card/40 p-8 text-center">
      {children}
    </div>
  )
}

function StatusIcon({ variant }: { variant: 'success' | 'error' | 'warning' }) {
  const styles = {
    success: 'bg-emerald-500/10 text-emerald-500',
    error: 'bg-destructive/10 text-destructive',
    warning: 'bg-amber-500/10 text-amber-500',
  }
  const icons = {
    success: <Check className="size-6" strokeWidth={2.5} />,
    error: <X className="size-6" strokeWidth={2.5} />,
    warning: <AlertCircle className="size-6" strokeWidth={2.5} />,
  }
  return (
    <div className={`flex size-12 items-center justify-center rounded-full ${styles[variant]}`}>
      {icons[variant]}
    </div>
  )
}

function HomeLink({ label }: { label: string }) {
  return (
    <a
      href="/"
      className="mt-4 text-sm text-primary underline-offset-4 hover:underline"
    >
      {label}
    </a>
  )
}
