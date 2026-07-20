'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useCallback, useMemo, Suspense } from 'react'
import { format } from 'date-fns'
import { Check, AlertCircle, Loader2, X } from 'lucide-react'
import { CalendarPicker } from '@/components/booking/calendar-picker'
import { TimeSlotGrid } from '@/components/booking/time-slot-grid'
import { getUserTimeZone, type Slot, type BookingResult } from '@/lib/booking-config'

type RescheduleState =
  | 'select'
  | 'confirming'
  | 'success'
  | 'error'
  | 'not-found'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const RESCHEDULE_COPY = {
  en: {
    invalidTitle: 'Invalid Link',
    invalidBody: 'This reschedule link is invalid or expired.',
    successTitle: 'Session Rescheduled',
    successPrefix: 'Your session is now on',
    successMid: 'at',
    successSuffix: "You'll receive an updated calendar invite shortly.",
    notFoundTitle: 'Not Found',
    notFoundBody: 'This booking was not found or has already been cancelled.',
    errorTitle: 'Something Went Wrong',
    genericError: 'Something went wrong.',
    connectError: 'Unable to connect. Please try again.',
    tryAgain: 'Try Again',
    contactUs: 'Contact Us',
    reschedulingText: 'Rescheduling your session...',
    selectTitle: 'Reschedule Your Session',
    selectSubtitle: 'Pick a new date and time. All times are shown in your local time zone.',
    confirmNewTime: 'Confirm New Time',
    backToSite: 'Back to syntra.build',
    dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
    availableTimesFor: 'Available times for',
    noSlotsAvailable: 'No times available for this day.',
    loadingSlots: 'Loading available times...',
    locale: 'en-US',
  },
  es: {
    invalidTitle: 'Enlace Invalido',
    invalidBody: 'Este enlace de reprogramacion es invalido o ha expirado.',
    successTitle: 'Sesion Reprogramada',
    successPrefix: 'Tu sesion ahora es el',
    successMid: 'a las',
    successSuffix: 'Recibiras una invitacion de calendario actualizada en breve.',
    notFoundTitle: 'No Encontrado',
    notFoundBody: 'Esta reserva no fue encontrada o ya ha sido cancelada.',
    errorTitle: 'Algo Salio Mal',
    genericError: 'Algo salio mal.',
    connectError: 'No se pudo conectar. Intenta de nuevo.',
    tryAgain: 'Intentar de Nuevo',
    contactUs: 'Contactanos',
    reschedulingText: 'Reprogramando tu sesion...',
    selectTitle: 'Reprogramar Tu Sesion',
    selectSubtitle: 'Elige una nueva fecha y hora. Todos los horarios se muestran en tu zona horaria local.',
    confirmNewTime: 'Confirmar Nuevo Horario',
    backToSite: 'Volver a syntra.build',
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
    prevMonth: 'Mes anterior',
    nextMonth: 'Mes siguiente',
    availableTimesFor: 'Horarios disponibles para',
    noSlotsAvailable: 'No hay horarios disponibles para este dia.',
    loadingSlots: 'Cargando horarios disponibles...',
    locale: 'es-ES',
  },
} as const

function RescheduleContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const lang = searchParams.get('lang') === 'es' ? 'es' : 'en'
  const t = RESCHEDULE_COPY[lang]

  const [state, setState] = useState<RescheduleState>('select')
  const [errorMessage, setErrorMessage] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [result, setResult] = useState<BookingResult | null>(null)

  // Visitor's detected IANA time zone — all times render in it.
  const userTimeZone = useMemo(() => getUserTimeZone(), [])

  const fetchSlots = useCallback(async (date: Date) => {
    setIsLoadingSlots(true)
    setSlots([])
    setSelectedSlot(null)

    const dateStr = format(date, 'yyyy-MM-dd')
    try {
      const res = await fetch(`/api/booking/slots?date=${dateStr}`)
      const data = await res.json()
      setSlots(res.ok ? data.slots || [] : [])
    } catch {
      setSlots([])
    } finally {
      setIsLoadingSlots(false)
    }
  }, [])

  const handleDateSelect = useCallback(
    (date: Date) => {
      setSelectedDate(date)
      setSelectedSlot(null)
      fetchSlots(date)
    },
    [fetchSlots]
  )

  const handleReschedule = useCallback(async () => {
    if (!token || !selectedSlot) return
    setState('confirming')
    setErrorMessage('')

    try {
      const res = await fetch('/api/booking/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cancelToken: token,
          slotStart: selectedSlot.start,
          slotEnd: selectedSlot.end,
          locale: lang,
        }),
      })
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

      setResult(data as BookingResult)
      setState('success')
    } catch {
      setErrorMessage(t.connectError)
      setState('error')
    }
  }, [token, selectedSlot, lang, t])

  if (!token || !UUID_RE.test(token)) {
    return (
      <Card>
        <StatusIcon variant="error" />
        <h1 className="text-lg font-semibold text-foreground">{t.invalidTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.invalidBody}</p>
        <HomeLink label={t.backToSite} />
      </Card>
    )
  }

  if (state === 'success' && result) {
    return (
      <Card>
        <StatusIcon variant="success" />
        <h1 className="text-lg font-semibold text-foreground">{t.successTitle}</h1>
        <p className="text-sm text-muted-foreground">
          {t.successPrefix} <strong>{result.displayDate}</strong> {t.successMid}{' '}
          <strong>{result.displayTime}</strong>. {t.successSuffix}
        </p>
        <HomeLink label={t.backToSite} />
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
            onClick={() => setState('select')}
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

  if (state === 'confirming') {
    return (
      <Card>
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t.reschedulingText}</p>
      </Card>
    )
  }

  // Select state — calendar + time picker
  return (
    <div className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-card/40 p-6">
      <div className="text-center">
        <h1 className="text-lg font-semibold text-foreground">{t.selectTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.selectSubtitle}</p>
      </div>

      <CalendarPicker
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        translations={{
          dayNamesShort: [...t.dayNamesShort],
          prevMonth: t.prevMonth,
          nextMonth: t.nextMonth,
          locale: t.locale,
        }}
      />

      {selectedDate && (
        <TimeSlotGrid
          slots={slots}
          selectedSlot={selectedSlot}
          onSlotSelect={setSelectedSlot}
          isLoading={isLoadingSlots}
          dateLabel={selectedDate.toLocaleDateString(t.locale, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
          timeZone={userTimeZone}
          locale={lang}
          translations={{
            availableTimesFor: t.availableTimesFor,
            noSlotsAvailable: t.noSlotsAvailable,
            loadingSlots: t.loadingSlots,
          }}
        />
      )}

      <button
        type="button"
        onClick={handleReschedule}
        disabled={!selectedSlot}
        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-40"
      >
        {t.confirmNewTime}
      </button>
    </div>
  )
}

export default function ReschedulePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Suspense
        fallback={
          <Card>
            <Loader2 className="size-8 animate-spin text-primary" />
          </Card>
        }
      >
        <RescheduleContent />
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
