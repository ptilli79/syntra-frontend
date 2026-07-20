'use client'

import { useState, useCallback, useMemo } from 'react'
import { format } from 'date-fns'
import { Loader2, AlertCircle, Check } from 'lucide-react'
import { CalendarPicker } from './calendar-picker'
import { TimeSlotGrid } from './time-slot-grid'
import { BookingConfirmation } from './booking-confirmation'
import {
  BOOKING_CONFIG,
  formatBookingDate,
  formatBookingTimeRange,
  getTimeZoneLabel,
  getUserTimeZone,
  type Slot,
  type BookingResult,
  type BookingCreatePayload,
  type BookingContactDetails,
} from '@/lib/booking-config'

type BookingSubStep =
  | 'selecting'
  | 'confirming'
  | 'confirmed'
  | 'cancelling'
  | 'cancelled'
  | 'error'

interface BookingStepProps {
  formData: {
    name?: string
    email?: string
    company?: string
    message?: string
    tier?: string
    locale?: 'en' | 'es'
    contactDetails?: BookingContactDetails
  }
  onClose: () => void
  translations: {
    header: string
    description: string
    dayNamesShort: string[]
    prevMonth: string
    nextMonth: string
    monthLocale: string
    availableTimes: string
    availableTimesFor: string
    noSlotsAvailable: string
    loadingSlots: string
    selectDateFirst: string
    confirmBooking: string
    bookingInProgress: string
    confirmedTitle: string
    confirmedBody: string
    dateLabel: string
    timeLabel: string
    durationLabel: string
    duration30min: string
    meetLinkLabel: string
    joinMeeting: string
    addToCalendar: string
    cancelSession: string
    rescheduleSession: string
    close: string
    cancelledTitle: string
    cancelledBody: string
    bookAnother: string
    slotTaken: string
    duplicateBooking: (email: string) => string
    serviceUnavailable: string
    tryAgain: string
    timezoneNote: string
    errorContactFallback: string
  }
}

export function BookingStep({ formData, onClose, translations }: BookingStepProps) {
  const [subStep, setSubStep] = useState<BookingSubStep>('selecting')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  // When set, the confirm action reschedules this existing booking instead of
  // creating a new one.
  const [modifyingToken, setModifyingToken] = useState<string | null>(null)

  // Visitor's detected IANA time zone — every time on screen is rendered in it.
  const userTimeZone = useMemo(() => getUserTimeZone(), [])
  const localeCode: 'en' | 'es' = formData.locale === 'es' ? 'es' : 'en'

  const fetchSlots = useCallback(async (date: Date) => {
    setIsLoadingSlots(true)
    setSlots([])
    setSelectedSlot(null)

    const dateStr = format(date, 'yyyy-MM-dd')

    try {
      const res = await fetch(`/api/booking/slots?date=${dateStr}`)
      const data = await res.json()

      if (!res.ok) {
        setSlots([])
        return
      }

      setSlots(data.slots || [])
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
      setErrorMessage('')
      fetchSlots(date)
    },
    [fetchSlots]
  )

  const handleConfirmBooking = useCallback(async () => {
    if (!selectedSlot) return

    setSubStep('confirming')
    setErrorMessage('')

    const endpoint = modifyingToken
      ? '/api/booking/reschedule'
      : '/api/booking/create'

    const payload = modifyingToken
      ? {
          cancelToken: modifyingToken,
          slotStart: selectedSlot.start,
          slotEnd: selectedSlot.end,
          locale: formData.locale || 'en',
          timezone: userTimeZone,
        }
      : ({
          slotStart: selectedSlot.start,
          slotEnd: selectedSlot.end,
          name: formData.name || '',
          email: formData.email || '',
          company: formData.company || '',
          message: formData.message || '',
          tier: formData.tier || 'strategy-session',
          locale: formData.locale || 'en',
          timezone: userTimeZone,
          contactDetails: formData.contactDetails,
        } satisfies BookingCreatePayload)

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409) {
          const errorCode = data.error
          if (errorCode === 'DUPLICATE_BOOKING') {
            setErrorMessage(translations.duplicateBooking(formData.email || ''))
          } else {
            setErrorMessage(translations.slotTaken)
          }
          setSubStep('selecting')
          if (selectedDate) fetchSlots(selectedDate)
          return
        }
        throw new Error(data.message || 'Booking failed')
      }

      setBookingResult({
        eventId: data.eventId,
        meetLink: data.meetLink,
        date: data.date,
        displayDate: data.displayDate,
        displayTime: data.displayTime,
        cancelToken: data.cancelToken,
      })
      setModifyingToken(null)
      setSubStep('confirmed')
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : translations.serviceUnavailable
      )
      setSubStep('error')
    }
  }, [selectedSlot, selectedDate, modifyingToken, formData, translations, fetchSlots, userTimeZone])

  const handleModify = useCallback(() => {
    if (bookingResult) setModifyingToken(bookingResult.cancelToken)
    setSelectedSlot(null)
    setErrorMessage('')
    setSubStep('selecting')
    if (selectedDate) fetchSlots(selectedDate)
  }, [bookingResult, selectedDate, fetchSlots])

  const handleCancel = useCallback(async () => {
    if (!bookingResult) return

    setSubStep('cancelling')
    setErrorMessage('')

    try {
      const res = await fetch(
        `/api/booking/cancel?token=${bookingResult.cancelToken}`
      )

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Cancellation failed')
      }

      setSubStep('cancelled')
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : translations.serviceUnavailable
      )
      setSubStep('error')
    }
  }, [bookingResult, translations])

  const handleBookAnother = useCallback(() => {
    setBookingResult(null)
    setSelectedSlot(null)
    setSelectedDate(null)
    setSlots([])
    setModifyingToken(null)
    setErrorMessage('')
    setSubStep('selecting')
  }, [])

  // Confirmed state
  if (subStep === 'confirmed' && bookingResult) {
    // Re-render the confirmed date/time in the visitor's local zone. The stored
    // instant is absolute UTC, so this only affects presentation.
    const startIso = bookingResult.date
    const endIso = new Date(
      new Date(startIso).getTime() + BOOKING_CONFIG.slotDurationMinutes * 60 * 1000,
    ).toISOString()
    const localResult: BookingResult = {
      ...bookingResult,
      displayDate: formatBookingDate(new Date(startIso), localeCode, userTimeZone),
      displayTime: formatBookingTimeRange(startIso, endIso, localeCode, userTimeZone),
    }
    return (
      <BookingConfirmation
        result={localResult}
        onClose={onClose}
        onModify={handleModify}
        onCancel={handleCancel}
        translations={{
          confirmedTitle: translations.confirmedTitle,
          confirmedBody: translations.confirmedBody,
          dateLabel: translations.dateLabel,
          timeLabel: translations.timeLabel,
          durationLabel: translations.durationLabel,
          duration30min: translations.duration30min,
          meetLinkLabel: translations.meetLinkLabel,
          joinMeeting: translations.joinMeeting,
          addToCalendar: translations.addToCalendar,
          cancelSession: translations.cancelSession,
          rescheduleSession: translations.rescheduleSession,
          close: translations.close,
        }}
      />
    )
  }

  // Confirming (loading) state
  if (subStep === 'confirming') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          {translations.bookingInProgress}
        </p>
      </div>
    )
  }

  // Cancelling (loading) state
  if (subStep === 'cancelling') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  // Cancelled state — rendered in-dialog, no page navigation
  if (subStep === 'cancelled') {
    return (
      <div className="flex flex-col items-center gap-6 py-2">
        <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10">
          <Check className="size-7 text-emerald-500" strokeWidth={2.5} />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">
            {translations.cancelledTitle}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {translations.cancelledBody}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2">
          <button
            type="button"
            onClick={handleBookAnother}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {translations.bookAnother}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-full items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            {translations.close}
          </button>
        </div>
      </div>
    )
  }

  // Error state
  if (subStep === 'error') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-7 text-destructive" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">{translations.serviceUnavailable}</p>
          <p className="mt-1 text-sm text-muted-foreground">{errorMessage}</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setSubStep('selecting')}
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {translations.tryAgain}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {translations.errorContactFallback}
        </p>
      </div>
    )
  }

  // Selecting state (default) — single-column layout
  const dateLabel = selectedDate
    ? selectedDate.toLocaleDateString(translations.monthLocale || 'en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : ''

  return (
    <div className="flex flex-col gap-3">
      {/* Error banner (for slot taken, etc.) */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
          <AlertCircle className="size-4 shrink-0 text-destructive" />
          <p className="text-xs text-destructive">{errorMessage}</p>
        </div>
      )}

      {/* Calendar picker — full width */}
      <CalendarPicker
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        translations={{
          dayNamesShort: translations.dayNamesShort,
          prevMonth: translations.prevMonth,
          nextMonth: translations.nextMonth,
          locale: translations.monthLocale,
        }}
      />

      {/* Time slots — appear below calendar when a date is selected */}
      {selectedDate && (
        <TimeSlotGrid
          slots={slots}
          selectedSlot={selectedSlot}
          onSlotSelect={setSelectedSlot}
          isLoading={isLoadingSlots}
          dateLabel={dateLabel}
          timeZone={userTimeZone}
          locale={localeCode}
          translations={{
            availableTimesFor: translations.availableTimesFor,
            noSlotsAvailable: translations.noSlotsAvailable,
            loadingSlots: translations.loadingSlots,
          }}
        />
      )}

      {/* Timezone note — shows the visitor's own detected zone, no ET jargon */}
      <p className="text-center text-xs text-muted-foreground">
        {translations.timezoneNote} {userTimeZone.replace(/_/g, ' ')} (
        {getTimeZoneLabel(new Date(), userTimeZone, localeCode)})
      </p>

      {/* Confirm button — always visible, disabled until a slot is selected */}
      <button
        type="button"
        onClick={handleConfirmBooking}
        disabled={!selectedSlot}
        className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {translations.confirmBooking}
      </button>
    </div>
  )
}
