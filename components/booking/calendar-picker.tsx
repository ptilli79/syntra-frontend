'use client'

import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isBefore,
  isAfter,
  addMonths,
  subMonths,
} from 'date-fns'
import { BOOKING_CONFIG } from '@/lib/booking-config'

interface CalendarPickerProps {
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  currentMonth: Date
  onMonthChange: (date: Date) => void
  translations: {
    dayNamesShort: string[]
    prevMonth: string
    nextMonth: string
    locale?: string
  }
}

export function CalendarPicker({
  selectedDate,
  onDateSelect,
  currentMonth,
  onMonthChange,
  translations,
}: CalendarPickerProps) {
  const today = new Date()
  const minDate = new Date(today.getTime() + BOOKING_CONFIG.minNoticeHours * 60 * 60 * 1000)
  const maxDate = new Date(today.getTime() + BOOKING_CONFIG.maxAdvanceDays * 24 * 60 * 60 * 1000)

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
    return eachDayOfInterval({ start: calStart, end: calEnd })
  }, [currentMonth])

  const canGoBack = isAfter(startOfMonth(currentMonth), startOfMonth(today))
  const canGoForward = isBefore(startOfMonth(currentMonth), startOfMonth(maxDate))

  function isDayAvailable(date: Date): boolean {
    const dayOfWeek = date.getDay()
    if (!BOOKING_CONFIG.availability[dayOfWeek]) return false
    if (isBefore(date, minDate) && !isSameDay(date, minDate)) return false
    if (isAfter(date, maxDate)) return false
    return true
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Month navigation */}
      <div className="flex items-center justify-between px-1 pb-2">
        <button
          type="button"
          onClick={() => onMonthChange(subMonths(currentMonth, 1))}
          disabled={!canGoBack}
          className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
          aria-label={translations.prevMonth}
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-base font-semibold capitalize text-foreground">
          {`${currentMonth.toLocaleDateString(translations.locale ?? 'en-US', {
            month: 'long',
          })} - ${currentMonth.getFullYear()}`}
        </span>
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
          disabled={!canGoForward}
          className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
          aria-label={translations.nextMonth}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Day of week headers */}
      <div className="grid grid-cols-7">
        {translations.dayNamesShort.map((day, index) => (
          <div
            key={index}
            className="flex h-10 items-center justify-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const inMonth = isSameMonth(day, currentMonth)
          const available = inMonth && isDayAvailable(day)
          const selected = selectedDate && isSameDay(day, selectedDate)
          const isToday = isSameDay(day, today)

          return (
            <div key={day.toISOString()} className="flex items-center justify-center py-0.5">
              <button
                type="button"
                onClick={() => available && onDateSelect(day)}
                disabled={!available}
                className={`
                  relative flex size-10 items-center justify-center rounded-full text-sm transition-all
                  ${!inMonth ? 'invisible' : ''}
                  ${available && !selected ? 'font-medium text-foreground hover:bg-primary/15 cursor-pointer' : ''}
                  ${!available && inMonth ? 'text-muted-foreground/30 cursor-not-allowed' : ''}
                  ${selected ? 'bg-primary text-primary-foreground font-semibold' : ''}
                  ${isToday && !selected && inMonth ? 'ring-1 ring-primary text-primary font-semibold' : ''}
                `}
              >
                {day.getDate()}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
