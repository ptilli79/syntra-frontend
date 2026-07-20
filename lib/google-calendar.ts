import { google } from 'googleapis'
import { BOOKING_CONFIG, type Slot } from './booking-config'

function getCalendarClient() {
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'hello@syntra.build'

  // Use JWT with subject (domain-wide delegation) to impersonate the calendar owner
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/calendar'],
    subject: calendarId, // Impersonate the calendar owner
  })

  return google.calendar({ version: 'v3', auth })
}

function getCalendarId() {
  return process.env.GOOGLE_CALENDAR_ID || 'hello@syntra.build'
}

/**
 * Get available time slots for a given date by querying Google Calendar free/busy.
 */
export async function getAvailableSlots(dateStr: string): Promise<Slot[]> {
  const calendar = getCalendarClient()
  const calendarId = getCalendarId()

  // Parse the date and get the day of week in Eastern time
  const date = new Date(dateStr + 'T00:00:00')
  const dayOfWeek = getDayOfWeekInTimezone(dateStr, BOOKING_CONFIG.timezone)
  const window = BOOKING_CONFIG.availability[dayOfWeek]

  if (!window) return []

  // Build time range in Eastern timezone, then convert to UTC for API query
  const timeMin = toUTC(dateStr, window.start, BOOKING_CONFIG.timezone)
  const timeMax = toUTC(dateStr, window.end, BOOKING_CONFIG.timezone)

  // Enforce max bookings per day: count appointments we created on this day.
  // Only our own bookings are counted (via bookingSource), not the owner's
  // personal calendar events.
  const dayBookings = await calendar.events.list({
    calendarId,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    privateExtendedProperty: [`bookingSource=${BOOKING_CONFIG.bookingSource}`],
  })
  if ((dayBookings.data.items?.length || 0) >= BOOKING_CONFIG.maxBookingsPerDay) {
    return []
  }

  // Query Google Calendar for busy times
  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      timeZone: BOOKING_CONFIG.timezone,
      items: [{ id: calendarId }],
    },
  })

  const busyPeriods =
    response.data.calendars?.[calendarId]?.busy || []

  // Generate all possible slots
  const allSlots = generateSlots(timeMin, timeMax, BOOKING_CONFIG.slotDurationMinutes)

  // Filter out slots that overlap with busy periods. Busy periods are expanded
  // by the configured buffer on each side so bookings are never back-to-back.
  const bufferMs = BOOKING_CONFIG.bufferMinutes * 60 * 1000
  const availableSlots = allSlots.filter((slot) => {
    const slotStart = new Date(slot.start).getTime()
    const slotEnd = new Date(slot.end).getTime()

    return !busyPeriods.some((busy) => {
      const busyStart = new Date(busy.start!).getTime() - bufferMs
      const busyEnd = new Date(busy.end!).getTime() + bufferMs
      return slotStart < busyEnd && slotEnd > busyStart
    })
  })

  // Filter out slots with less than minimum notice
  const minNoticeTime = Date.now() + BOOKING_CONFIG.minNoticeHours * 60 * 60 * 1000
  return availableSlots.filter((slot) => new Date(slot.start).getTime() >= minNoticeTime)
}

/**
 * Look up a booking's core details by its cancel token, used to regenerate an
 * .ics file on demand (e.g. for the "Outlook / Other" download link).
 */
export async function getBookingByCancelToken(cancelToken: string): Promise<{
  found: boolean
  event?: {
    company: string
    start: string
    end: string
    meetLink: string
    customerEmail: string
    customerName: string
    locale: 'en' | 'es'
  }
}> {
  const calendar = getCalendarClient()
  const calendarId = getCalendarId()

  const response = await calendar.events.list({
    calendarId,
    privateExtendedProperty: [`cancelToken=${cancelToken}`],
    singleEvents: true,
    maxResults: 1,
  })

  const event = response.data.items?.[0]
  if (!event) return { found: false }

  const meetLink =
    event.conferenceData?.entryPoints?.find((ep) => ep.entryPointType === 'video')?.uri || ''

  return {
    found: true,
    event: {
      company: event.extendedProperties?.private?.company || '',
      start: event.start?.dateTime || '',
      end: event.end?.dateTime || '',
      meetLink,
      customerEmail: event.extendedProperties?.private?.customerEmail || '',
      customerName: event.extendedProperties?.private?.customerName || '',
      locale: event.extendedProperties?.private?.locale === 'es' ? 'es' : 'en',
    },
  }
}

/**
 * Create a booking event on Google Calendar with a Google Meet link.
 */
export async function createBookingEvent(params: {
  start: string
  end: string
  name: string
  email: string
  company: string
  message: string
  tier: string
  cancelToken: string
  locale?: 'en' | 'es'
}): Promise<{ eventId: string; meetLink: string; htmlLink: string }> {
  const calendar = getCalendarClient()
  const calendarId = getCalendarId()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://syntra.build'
  const locale = params.locale === 'es' ? 'es' : 'en'
  const lbl =
    locale === 'es'
      ? { contact: 'Contacto', company: 'Empresa', tier: 'Plan', reschedule: 'Reprogramar', cancel: 'Cancelar' }
      : { contact: 'Contact', company: 'Company', tier: 'Tier', reschedule: 'Reschedule', cancel: 'Cancel' }

  // Google Calendar descriptions support a subset of HTML, so the details are
  // laid out as a single vertical column and the manage links are rendered as
  // clickable anchors instead of raw URLs. User-provided values are escaped to
  // avoid breaking the markup.
  const rescheduleUrl = `${siteUrl}/booking/reschedule?token=${params.cancelToken}&amp;lang=${locale}`
  const cancelUrl = `${siteUrl}/booking/cancel?token=${params.cancelToken}&amp;lang=${locale}`
  const description = [
    `<b>${lbl.contact}:</b> ${escapeCalendarHtml(params.name)} (${escapeCalendarHtml(params.email)})`,
    `<b>${lbl.company}:</b> ${escapeCalendarHtml(params.company)}`,
    `<b>${lbl.tier}:</b> ${escapeCalendarHtml(params.tier)}`,
    '',
    `<a href="${rescheduleUrl}">${lbl.reschedule}</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="${cancelUrl}">${lbl.cancel}</a>`,
  ].join('<br>')

  const event = await calendar.events.insert({
    calendarId,
    conferenceDataVersion: 1,
    // Suppress Google's own attendee invitation email: our branded confirmation
    // (with Join/Reschedule/Cancel buttons) is the single customer-facing email.
    // The event still lands on the Syntra calendar as the organizer.
    sendUpdates: 'none',
    requestBody: {
      summary: `Strategy Session - ${params.company} + Syntra`,
      description,
      start: {
        dateTime: params.start,
        timeZone: BOOKING_CONFIG.timezone,
      },
      end: {
        dateTime: params.end,
        timeZone: BOOKING_CONFIG.timezone,
      },
      attendees: [
        { email: params.email, displayName: params.name },
        { email: 'hello@syntra.build', displayName: 'Syntra Systems' },
      ],
      conferenceData: {
        createRequest: {
          requestId: params.cancelToken,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
      extendedProperties: {
        private: {
          cancelToken: params.cancelToken,
          customerEmail: params.email,
          customerName: params.name,
          company: params.company,
          bookingSource: BOOKING_CONFIG.bookingSource,
          locale,
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 1440 },
          { method: 'email', minutes: 60 },
        ],
      },
    },
  })

  const meetLink =
    event.data.conferenceData?.entryPoints?.find(
      (ep) => ep.entryPointType === 'video'
    )?.uri || ''

  return {
    eventId: event.data.id!,
    meetLink,
    htmlLink: event.data.htmlLink || '',
  }
}

/**
 * Find and cancel an event by its cancel token.
 */
export async function findAndCancelEvent(cancelToken: string): Promise<{
  found: boolean
  event?: {
    summary: string
    start: string
    customerEmail: string
    customerName: string
    locale: 'en' | 'es'
  }
}> {
  const calendar = getCalendarClient()
  const calendarId = getCalendarId()

  const response = await calendar.events.list({
    calendarId,
    privateExtendedProperty: [`cancelToken=${cancelToken}`],
    singleEvents: true,
    maxResults: 1,
  })

  const event = response.data.items?.[0]
  if (!event) return { found: false }

  await calendar.events.delete({
    calendarId,
    eventId: event.id!,
    sendUpdates: 'all',
  })

  return {
    found: true,
    event: {
      summary: event.summary || '',
      start: event.start?.dateTime || '',
      customerEmail: event.extendedProperties?.private?.customerEmail || '',
      customerName: event.extendedProperties?.private?.customerName || '',
      locale: event.extendedProperties?.private?.locale === 'es' ? 'es' : 'en',
    },
  }
}

/**
 * Find a booking by its cancel token and move it to a new time slot.
 * The event keeps its id, cancel token and Google Meet link; Google sends
 * "event updated" notifications to attendees automatically.
 */
export async function rescheduleBookingEvent(params: {
  cancelToken: string
  start: string
  end: string
}): Promise<{
  found: boolean
  eventId?: string
  meetLink?: string
  htmlLink?: string
  customerEmail?: string
  customerName?: string
  company?: string
  locale?: 'en' | 'es'
  previousStart?: string
  previousEnd?: string
}> {
  const calendar = getCalendarClient()
  const calendarId = getCalendarId()

  const response = await calendar.events.list({
    calendarId,
    privateExtendedProperty: [`cancelToken=${params.cancelToken}`],
    singleEvents: true,
    maxResults: 1,
  })

  const existing = response.data.items?.[0]
  if (!existing) return { found: false }

  const updated = await calendar.events.patch({
    calendarId,
    eventId: existing.id!,
    // Suppress Google's own attendee notification email: we send our own
    // branded reschedule confirmation instead.
    sendUpdates: 'none',
    requestBody: {
      start: {
        dateTime: params.start,
        timeZone: BOOKING_CONFIG.timezone,
      },
      end: {
        dateTime: params.end,
        timeZone: BOOKING_CONFIG.timezone,
      },
    },
  })

  const meetLink =
    updated.data.conferenceData?.entryPoints?.find(
      (ep) => ep.entryPointType === 'video'
    )?.uri || ''

  return {
    found: true,
    eventId: updated.data.id!,
    meetLink,
    htmlLink: updated.data.htmlLink || '',
    customerEmail: existing.extendedProperties?.private?.customerEmail || '',
    customerName: existing.extendedProperties?.private?.customerName || '',
    company: existing.extendedProperties?.private?.company || '',
    locale: existing.extendedProperties?.private?.locale === 'es' ? 'es' : 'en',
    previousStart: existing.start?.dateTime || '',
    previousEnd: existing.end?.dateTime || '',
  }
}

/**
 * Check if there is already an active (future) booking for the given email.
 * Queries booking events by customerEmail stored in extendedProperties.
 * Only customerEmail is filtered (bookingSource omitted) to avoid the slow
 * multi-property scan Google Calendar performs on large calendars.
 */
export async function hasActiveBooking(email: string): Promise<boolean> {
  const calendar = getCalendarClient()
  const calendarId = getCalendarId()

  // Limit search to the next 60 days — no booking should be further out.
  const timeMax = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()

  const response = await calendar.events.list({
    calendarId,
    timeMin: new Date().toISOString(),
    timeMax,
    singleEvents: true,
    privateExtendedProperty: [`customerEmail=${email}`],
    maxResults: 1,
    fields: 'items(id)',
  })

  return (response.data.items?.length || 0) > 0
}

/**
 * Verify that a specific time slot is still available (race condition guard).
 */
export async function isSlotAvailable(start: string, end: string): Promise<boolean> {
  const calendar = getCalendarClient()
  const calendarId = getCalendarId()

  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin: start,
      timeMax: end,
      timeZone: BOOKING_CONFIG.timezone,
      items: [{ id: calendarId }],
    },
  })

  const busyPeriods = response.data.calendars?.[calendarId]?.busy || []
  return busyPeriods.length === 0
}

// --- Utility functions ---

function escapeCalendarHtml(text: string): string {
  return (text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function generateSlots(start: Date, end: Date, durationMinutes: number): Slot[] {
  const slots: Slot[] = []
  const current = new Date(start)

  while (current.getTime() + durationMinutes * 60 * 1000 <= end.getTime()) {
    const slotEnd = new Date(current.getTime() + durationMinutes * 60 * 1000)
    slots.push({
      start: current.toISOString(),
      end: slotEnd.toISOString(),
      displayTime: formatTimeET(current),
    })
    current.setTime(current.getTime() + durationMinutes * 60 * 1000)
  }

  return slots
}

function formatTimeET(date: Date): string {
  return date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: BOOKING_CONFIG.timezone,
  })
}

function getDayOfWeekInTimezone(dateStr: string, timezone: string): number {
  // Create a date at noon UTC to avoid timezone edge cases
  const d = new Date(dateStr + 'T12:00:00Z')
  const formatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    timeZone: timezone,
  })
  const dayName = formatter.format(d)
  const dayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  }
  return dayMap[dayName] ?? 0
}

function toUTC(dateStr: string, timeStr: string, timezone: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hours, minutes] = timeStr.split(':').map(Number)

  // Interpret the wall-clock time as if it were UTC, then correct by the
  // target timezone's offset at that instant.
  const naiveUtcMs = Date.UTC(year, month - 1, day, hours, minutes, 0)
  const offsetMs = getTimezoneOffsetMs(timezone, new Date(naiveUtcMs))
  return new Date(naiveUtcMs - offsetMs)
}

/**
 * Returns the offset of `timezone` at the given instant, where
 * localTime = utcTime + offset. Eastern Daylight Time yields -4h.
 */
function getTimezoneOffsetMs(timezone: string, date: Date): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  const parts = formatter.formatToParts(date)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  // Intl renders hour "24" for midnight; normalize to 0.
  const hour = get('hour') % 24
  const localAsUtcMs = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    hour,
    get('minute'),
    get('second')
  )
  return localAsUtcMs - date.getTime()
}

