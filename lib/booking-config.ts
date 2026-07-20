export const BOOKING_CONFIG = {
  timezone: 'America/New_York',
  slotDurationMinutes: 30,
  maxAdvanceDays: 35,
  minNoticeHours: 72,

  // Buffer (minutes) enforced around existing bookings so meetings never sit
  // back-to-back. Mirrors "Buffer time" on the Google booking page.
  bufferMinutes: 15,

  // Max appointments booked through this scheduler per calendar day.
  // Mirrors "Maximum bookings per day" on the Google booking page.
  maxBookingsPerDay: 2,

  // Marker written to every booking we create, used to count bookings/day
  // without counting the owner's personal calendar events.
  bookingSource: 'syntra',

  // Availability by day of week (0=Sunday, 6=Saturday)
  // Times are in Eastern Time (America/New_York)
  // Weekends blocked; weekdays available 9:00 AM - 6:00 PM.
  availability: {
    0: null, // Sunday
    1: { start: '09:00', end: '18:00' }, // Monday
    2: { start: '09:00', end: '18:00' }, // Tuesday
    3: { start: '09:00', end: '18:00' }, // Wednesday
    4: { start: '09:00', end: '18:00' }, // Thursday
    5: { start: '09:00', end: '18:00' }, // Friday
    6: null, // Saturday
  } as Record<number, { start: string; end: string } | null>,
} as const

export interface Slot {
  start: string // ISO 8601 UTC
  end: string // ISO 8601 UTC
  displayTime: string // Formatted in Eastern: "2:00 PM"
}

export interface BookingResult {
  eventId: string
  meetLink: string
  date: string // ISO date string
  displayDate: string // Formatted display: "Monday, July 21, 2026"
  displayTime: string // Formatted display: "2:00 PM - 2:30 PM ET"
  cancelToken: string
}

export interface BookingCreatePayload {
  slotStart: string // ISO 8601 UTC
  slotEnd: string // ISO 8601 UTC
  name: string
  email: string
  company: string
  message: string
  tier: string
  locale: 'en' | 'es'
  timezone?: string // IANA time zone of the visitor, e.g. "America/Mexico_City"
  contactDetails?: BookingContactDetails // Full demo-form answers, for the PDF
}

/**
 * The detailed demo-form answers collected before scheduling. Kept as a plain,
 * client-safe shape (no server imports) so it can travel from the booking UI to
 * the API, which rebuilds the PDF the "Send details" flow already produces.
 */
export interface BookingContactDetails {
  tierTitle?: string
  industry?: string
  teamSize?: string
  mainChallenge?: string
  coreOperations?: string[]
  proCapabilities?: string[]
  monthlyVolume?: string
  deployment?: string
  budgetRange?: string
  currentTools?: string[]
  currentToolsOther?: string
  timeline?: string
}

export interface BookingError {
  error: string
  message: string
}

/**
 * Format a booking date for display in the configured booking timezone.
 * Examples: "Friday, July 24, 2026" (en), "Miércoles, 29-Julio-2026" (es).
 *
 * The leading weekday is always capitalized because it starts the line. The
 * Spanish form uses hyphen separators and a capitalized month for a compact,
 * consistent look.
 */
export function formatBookingDate(
  date: Date,
  locale: 'en' | 'es',
  timeZone: string = BOOKING_CONFIG.timezone,
): string {
  const loc = locale === 'es' ? 'es-ES' : 'en-US'
  const parts = new Intl.DateTimeFormat(loc, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone,
  }).formatToParts(date)

  const get = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((p) => p.type === type)?.value ?? ''

  const capitalize = (value: string): string =>
    value.charAt(0).toUpperCase() + value.slice(1)

  const weekday = capitalize(get('weekday'))
  const day = get('day')
  const month = get('month')
  const year = get('year')

  return locale === 'es'
    ? `${weekday}, ${day}-${capitalize(month)}-${year}`
    : `${weekday}, ${month} ${day}, ${year}`
}

/**
 * The visitor's IANA time zone (e.g. "America/Mexico_City"), detected from the
 * browser. Falls back to the booking timezone when detection fails.
 */
export function getUserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || BOOKING_CONFIG.timezone
  } catch {
    return BOOKING_CONFIG.timezone
  }
}

/**
 * Whether `tz` is a valid IANA time zone accepted by Intl. Used to guard
 * against untrusted client-supplied values before formatting server-side.
 */
export function isValidTimeZone(tz?: string | null): tz is string {
  if (!tz) return false
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz })
    return true
  } catch {
    return false
  }
}

/**
 * Short, human-facing time-zone label for a given instant.
 * Examples: "EST", "CST", "GMT+1". DST is resolved from the supplied date.
 */
export function getTimeZoneLabel(
  date: Date,
  timeZone: string,
  locale: 'en' | 'es' = 'en',
): string {
  const loc = locale === 'es' ? 'es-ES' : 'en-US'
  const parts = new Intl.DateTimeFormat(loc, {
    timeZone,
    timeZoneName: 'short',
  }).formatToParts(date)
  return parts.find((p) => p.type === 'timeZoneName')?.value ?? ''
}

/**
 * A single localized time in the given time zone, e.g. "3:30 PM".
 * Used for compact slot buttons.
 */
export function formatBookingTime(
  iso: string,
  locale: 'en' | 'es',
  timeZone: string,
): string {
  const loc = locale === 'es' ? 'es-ES' : 'en-US'
  return new Date(iso).toLocaleTimeString(loc, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone,
  })
}

/**
 * A localized start–end time range with a trailing time-zone label, formatted
 * in the given time zone. Example: "3:30 PM \u2013 4:00 PM CST".
 */
export function formatBookingTimeRange(
  startIso: string,
  endIso: string,
  locale: 'en' | 'es',
  timeZone: string,
): string {
  const start = formatBookingTime(startIso, locale, timeZone)
  const end = formatBookingTime(endIso, locale, timeZone)
  const label = getTimeZoneLabel(new Date(startIso), timeZone, locale)
  return `${start} \u2013 ${end}${label ? ` ${label}` : ''}`
}
