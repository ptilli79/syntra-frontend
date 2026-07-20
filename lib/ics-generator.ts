/**
 * Generate an ICS (iCalendar) file content for a booking event.
 */
export function generateICS(params: {
  uid: string
  summary: string
  description: string
  start: Date
  end: Date
  meetLink: string
  organizerEmail: string
  organizerName: string
  attendeeEmail: string
  attendeeName: string
}): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Syntra Systems//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${params.uid}@syntra.build`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(params.start)}`,
    `DTEND:${formatICSDate(params.end)}`,
    `SUMMARY:${escapeICS(params.summary)}`,
    `DESCRIPTION:${escapeICS(params.description + '\\nGoogle Meet: ' + params.meetLink)}`,
    `LOCATION:${escapeICS(params.meetLink)}`,
    `URL:${params.meetLink}`,
    `ORGANIZER;CN=${escapeICS(params.organizerName)}:mailto:${params.organizerEmail}`,
    `ATTENDEE;CN=${escapeICS(params.attendeeName)};PARTSTAT=ACCEPTED:mailto:${params.attendeeEmail}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Strategy Session in 1 hour',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Strategy Session tomorrow',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  return lines.map(foldLine).join('\r\n')
}

/**
 * RFC 5545 requires content lines to be folded at 75 octets: split into a
 * first line plus continuation lines, each continuation starting with a
 * space. Without this, strict calendar clients (notably some Outlook/Exchange
 * setups) can silently reject the whole file on long DESCRIPTION/ATTENDEE lines.
 */
function foldLine(line: string): string {
  const maxLen = 75
  if (line.length <= maxLen) return line

  const chunks: string[] = []
  let rest = line
  let first = true
  while (rest.length > 0) {
    const limit = first ? maxLen : maxLen - 1
    chunks.push((first ? '' : ' ') + rest.slice(0, limit))
    rest = rest.slice(limit)
    first = false
  }
  return chunks.join('\r\n')
}

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}
