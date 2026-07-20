'use client'

import { Check, Video, Calendar, X } from 'lucide-react'
import type { BookingResult } from '@/lib/booking-config'

interface BookingConfirmationProps {
  result: BookingResult
  onClose: () => void
  onModify: () => void
  onCancel: () => void
  translations: {
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
  }
}

export function BookingConfirmation({
  result,
  onClose,
  onModify,
  onCancel,
  translations,
}: BookingConfirmationProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-2">
      {/* Success icon */}
      <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10">
        <Check className="size-7 text-emerald-500" strokeWidth={2.5} />
      </div>

      {/* Confirmation text */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground">
          {translations.confirmedTitle}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {translations.confirmedBody}
        </p>
      </div>

      {/* Meeting details card */}
      <div className="w-full rounded-lg border border-border bg-card/40 p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">{translations.dateLabel}</p>
              <p className="text-sm font-medium text-foreground">{result.displayDate}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">{translations.timeLabel}</p>
              <p className="text-sm font-medium text-foreground">{result.displayTime}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">{translations.durationLabel}</p>
              <p className="text-sm font-medium text-foreground">{translations.duration30min}</p>
            </div>
          </div>

          {result.meetLink && (
            <div className="flex items-start gap-3">
              <Video className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{translations.meetLinkLabel}</p>
                <a
                  href={result.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  {translations.joinMeeting}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex w-full flex-col gap-2">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {translations.close}
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onModify}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            {translations.rescheduleSession}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            {translations.cancelSession}
          </button>
        </div>
      </div>
    </div>
  )
}
