'use client'

import { formatBookingTime, type Slot } from '@/lib/booking-config'

interface TimeSlotGridProps {
  slots: Slot[]
  selectedSlot: Slot | null
  onSlotSelect: (slot: Slot) => void
  isLoading: boolean
  dateLabel: string
  /** Visitor's IANA time zone. When set, slot times render in this zone. */
  timeZone?: string
  locale?: 'en' | 'es'
  translations: {
    availableTimesFor: string
    noSlotsAvailable: string
    loadingSlots: string
  }
}

export function TimeSlotGrid({
  slots,
  selectedSlot,
  onSlotSelect,
  isLoading,
  dateLabel,
  timeZone,
  locale = 'en',
  translations,
}: TimeSlotGridProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 pt-2">
        <p className="text-sm font-medium text-muted-foreground">
          {translations.loadingSlots}
        </p>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded-lg bg-muted/40"
            />
          ))}
        </div>
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <div className="flex items-center justify-center py-6">
        <p className="text-sm text-muted-foreground">
          {translations.noSlotsAvailable}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 pt-2">
      {/* Date label */}
      <p className="text-sm font-medium text-muted-foreground">
        {translations.availableTimesFor} — {dateLabel}
      </p>

      {/* 4-column time slot grid */}
      <div className="grid grid-cols-4 gap-2">
        {slots.map((slot) => {
          const isSelected = selectedSlot?.start === slot.start
          return (
            <button
              key={slot.start}
              type="button"
              onClick={() => onSlotSelect(slot)}
              className={`
                rounded-lg border px-2 py-2.5 text-sm font-medium transition-all
                ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-foreground hover:border-primary/50 hover:bg-muted/50'
                }
              `}
            >
              {timeZone ? formatBookingTime(slot.start, locale, timeZone) : slot.displayTime}
            </button>
          )
        })}
      </div>
    </div>
  )
}
