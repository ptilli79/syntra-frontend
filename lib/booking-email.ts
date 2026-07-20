import { transporter, buildContactPdfAttachment, type ContactFormData } from './email'
import { generateICS } from './ics-generator'
import { BOOKING_CONFIG } from './booking-config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://syntra.build'
const FROM_EMAIL = process.env.SMTP_USER || 'hello@syntra.build'
const LOGO_URL = `${SITE_URL}/logo_transparent_black.png`

interface BookingConfirmationParams {
  name: string
  email: string
  company: string
  date: string // ISO string
  displayDate: string
  displayTime: string
  duration: string
  meetLink: string
  cancelToken: string
  locale: 'en' | 'es'
  previousDisplayDate?: string
  previousDisplayTime?: string
}

interface BookingNotificationParams {
  name: string
  email: string
  company: string
  message: string
  tier: string
  displayDate: string // Eastern-time date (team's operating zone)
  displayTime: string // Eastern-time range, e.g. "3:30 PM – 4:00 PM EDT"
  clientTimezone?: string // Visitor's IANA zone, shown when it differs from ET
  clientDisplayTime?: string // Same slot rendered in the visitor's zone
  meetLink: string
  eventLink?: string
  locale: 'en' | 'es'
  contactData?: ContactFormData // Full demo-form submission, attached as a PDF
}

interface CancellationEmailParams {
  name: string
  email: string
  eventSummary: string
  eventDate: string
  locale: 'en' | 'es'
}

export async function sendBookingConfirmation(params: BookingConfirmationParams): Promise<void> {
  const { name, email, date, displayDate, displayTime, duration, meetLink, cancelToken, locale, company } = params
  const isEs = locale === 'es'

  // Generate ICS file
  const startDate = new Date(date)
  const endDate = new Date(startDate.getTime() + BOOKING_CONFIG.slotDurationMinutes * 60 * 1000)

  const icsContent = generateICS({
    uid: cancelToken,
    summary: `Strategy Session - ${company} + Syntra`,
    description: isEs
      ? `Sesion de estrategia con Syntra Systems`
      : `Strategy session with Syntra Systems`,
    start: startDate,
    end: endDate,
    meetLink,
    organizerEmail: 'hello@syntra.build',
    organizerName: 'Syntra Systems',
    attendeeEmail: email,
    attendeeName: name,
  })

  // "Add to Calendar" button target: a universal Google Calendar template link
  // that works for every recipient without relying on the attachment.
  const gcalDetails = isEs
    ? `Sesion de estrategia con Syntra Systems.${meetLink ? `\nGoogle Meet: ${meetLink}` : ''}`
    : `Strategy session with Syntra Systems.${meetLink ? `\nGoogle Meet: ${meetLink}` : ''}`
  const addToCalendarUrl =
    `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=${encodeURIComponent(`Strategy Session - ${company} + Syntra`)}` +
    `&dates=${formatGoogleCalendarDate(startDate)}/${formatGoogleCalendarDate(endDate)}` +
    `&details=${encodeURIComponent(gcalDetails)}` +
    `&location=${encodeURIComponent(meetLink || 'Google Meet')}`

  // Outlook.com / Hotmail / Live one-click deeplink (Office 365 work accounts
  // are also handled; anything else falls back to the .ics download below).
  const outlookCalendarUrl =
    `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent` +
    `&subject=${encodeURIComponent(`Strategy Session - ${company} + Syntra`)}` +
    `&startdt=${startDate.toISOString()}` +
    `&enddt=${endDate.toISOString()}` +
    `&body=${encodeURIComponent(gcalDetails)}` +
    `&location=${encodeURIComponent(meetLink || 'Google Meet')}`

  const subject = isEs
    ? `Sesion confirmada - ${displayDate}`
    : `Session confirmed - ${displayDate}`

  // Self-manage links (the same targets Google's invite used to provide) so the
  // customer can reschedule or cancel directly from our branded email.
  const manageLang = isEs ? 'es' : 'en'
  const rescheduleUrl = `${SITE_URL}/booking/reschedule?token=${cancelToken}&lang=${manageLang}`
  const cancelUrl = `${SITE_URL}/booking/cancel?token=${cancelToken}&lang=${manageLang}`

  // Standalone .ics download for non-Google calendar apps (Outlook, Apple
  // Calendar, etc.) - more reliable than pointing people at the attachment.
  const icsDownloadUrl = `${SITE_URL}/api/booking/ics?token=${cancelToken}&lang=${manageLang}`

  const html = buildConfirmationHtml({
    name,
    company,
    displayDate,
    displayTime,
    duration,
    addToCalendarUrl,
    outlookCalendarUrl,
    icsDownloadUrl,
    meetLink,
    rescheduleUrl,
    cancelUrl,
    isEs,
  })

  await transporter.sendMail({
    from: `"Syntra Notifications" <${FROM_EMAIL}>`,
    to: email,
    subject,
    html,
    attachments: [
      {
        filename: 'syntra-session.ics',
        content: icsContent,
        contentType: 'text/calendar; charset=utf-8',
        contentDisposition: 'attachment',
      },
    ],
  })
}

export async function sendRescheduleConfirmation(params: BookingConfirmationParams): Promise<void> {
  const { name, email, date, displayDate, displayTime, duration, meetLink, cancelToken, locale, company, previousDisplayDate, previousDisplayTime } = params
  const isEs = locale === 'es'

  // Generate updated ICS file
  const startDate = new Date(date)
  const endDate = new Date(startDate.getTime() + BOOKING_CONFIG.slotDurationMinutes * 60 * 1000)

  const icsContent = generateICS({
    uid: cancelToken,
    summary: `Strategy Session - ${company} + Syntra`,
    description: isEs
      ? `Sesion de estrategia con Syntra Systems`
      : `Strategy session with Syntra Systems`,
    start: startDate,
    end: endDate,
    meetLink,
    organizerEmail: 'hello@syntra.build',
    organizerName: 'Syntra Systems',
    attendeeEmail: email,
    attendeeName: name,
  })

  const gcalDetails = isEs
    ? `Sesion de estrategia con Syntra Systems.${meetLink ? `\nGoogle Meet: ${meetLink}` : ''}`
    : `Strategy session with Syntra Systems.${meetLink ? `\nGoogle Meet: ${meetLink}` : ''}`
  const addToCalendarUrl =
    `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=${encodeURIComponent(`Strategy Session - ${company} + Syntra`)}` +
    `&dates=${formatGoogleCalendarDate(startDate)}/${formatGoogleCalendarDate(endDate)}` +
    `&details=${encodeURIComponent(gcalDetails)}` +
    `&location=${encodeURIComponent(meetLink || 'Google Meet')}`
  const outlookCalendarUrl =
    `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent` +
    `&subject=${encodeURIComponent(`Strategy Session - ${company} + Syntra`)}` +
    `&startdt=${startDate.toISOString()}` +
    `&enddt=${endDate.toISOString()}` +
    `&body=${encodeURIComponent(gcalDetails)}` +
    `&location=${encodeURIComponent(meetLink || 'Google Meet')}`

  const manageLang = isEs ? 'es' : 'en'
  const rescheduleUrl = `${SITE_URL}/booking/reschedule?token=${cancelToken}&lang=${manageLang}`
  const cancelUrl = `${SITE_URL}/booking/cancel?token=${cancelToken}&lang=${manageLang}`
  const icsDownloadUrl = `${SITE_URL}/api/booking/ics?token=${cancelToken}&lang=${manageLang}`

  const subject = isEs
    ? `Sesión reprogramada - ${displayDate}`
    : `Session rescheduled - ${displayDate}`

  const html = buildConfirmationHtml({
    name,
    company,
    displayDate,
    displayTime,
    duration,
    addToCalendarUrl,
    outlookCalendarUrl,
    icsDownloadUrl,
    meetLink,
    rescheduleUrl,
    cancelUrl,
    isEs,
    rescheduled: true,
    previousDisplayDate,
    previousDisplayTime,
  })

  await transporter.sendMail({
    from: `"Syntra Notifications" <${FROM_EMAIL}>`,
    to: email,
    subject,
    html,
    attachments: [
      {
        filename: 'syntra-session.ics',
        content: icsContent,
        contentType: 'text/calendar; charset=utf-8',
        contentDisposition: 'attachment',
      },
    ],
  })
}

export async function sendBookingNotification(params: BookingNotificationParams): Promise<void> {
  const { name, email, company, message, displayDate, displayTime, locale, meetLink, eventLink, clientTimezone, clientDisplayTime, contactData } = params
  const isEs = locale === 'es'
  const startTime = displayTime.split(' \u2013 ')[0] || displayTime

  // Only surface the client's local time when it actually differs from ET.
  const clientTz =
    clientTimezone && clientTimezone !== BOOKING_CONFIG.timezone ? clientTimezone : ''
  const showClientTz = Boolean(clientTz && clientDisplayTime)
  const clientTzPretty = clientTz.replace(/_/g, ' ')

  const nameEsc = escapeHtml(name)
  const emailEsc = escapeHtml(email)
  const companyEsc = escapeHtml(company)
  const calendarHref = (eventLink || 'https://calendar.google.com/calendar/').replace(/&/g, '&amp;')
  // Force the host Google account on the Meet link so the internal team joins
  // directly as the organizer instead of landing in the "ask to join" lobby
  // (which happens when Meet can't tell which signed-in account is invited).
  const hostAccount = process.env.GOOGLE_CALENDAR_ID || process.env.CONTACT_EMAIL || FROM_EMAIL
  const meetJoinUrl = meetLink
    ? `${meetLink}${meetLink.includes('?') ? '&' : '?'}authuser=${encodeURIComponent(hostAccount)}`
    : ''
  const meetHref = meetJoinUrl.replace(/&/g, '&amp;')

  const t = isEs
    ? {
        title: 'Nueva reserva - Syntra',
        internal: 'Interno',
        newBooking: 'Nueva reserva',
        scheduledFor: `Se ha agendado una sesión de estrategia para el <strong>${displayDate}</strong> a las <strong>${startTime}</strong>.`,
        clientInfo: 'Información del Cliente',
        nameLabel: 'Nombre',
        emailLabel: 'Correo',
        companyLabel: 'Empresa',
        dateLabel: 'Fecha',
        timeLabel: 'Hora (ET)',
        timezoneLabel: 'Zona del cliente',
        localTimeLabel: 'Hora local del cliente',
        whatFix: 'Lo que quieren resolver',
        beforeCall: 'Antes de la llamada',
        checklist: [
          'Enviar invitación de calendario con enlace de video al cliente',
          'Revisar el sitio web y LinkedIn de la empresa',
          'Preparar preguntas de descubrimiento según su problema',
          'Bloquear 30 min post-llamada para notas y seguimiento',
        ],
        joinMeeting: 'Unirse a la llamada',
        openCalendar: 'Calendario',
        replyClient: 'Responder',
      }
    : {
        title: 'New booking - Syntra',
        internal: 'Internal',
        newBooking: 'New booking',
        scheduledFor: `A strategy session has been scheduled for <strong>${displayDate}</strong> at <strong>${startTime}</strong>.`,
        clientInfo: 'Client Info',
        nameLabel: 'Name',
        emailLabel: 'Email',
        companyLabel: 'Company',
        dateLabel: 'Date',
        timeLabel: 'Time (ET)',
        timezoneLabel: 'Client timezone',
        localTimeLabel: "Client's local time",
        whatFix: "What they're trying to fix",
        beforeCall: 'Before the call',
        checklist: [
          'Send calendar invite with video link to client',
          'Review company website and LinkedIn',
          'Prep discovery questions based on their problem statement',
          'Block 30 min post-call for notes and follow-up draft',
        ],
        joinMeeting: 'Join call',
        openCalendar: 'Calendar',
        replyClient: 'Reply',
      }

  const infoRow = (label: string, value: string, last = false): string => `
                <tr>
                  <td style="padding:10px 0;${last ? '' : 'border-bottom:1px solid #eef0f3;'}font-size:13px;color:#94a3b8;width:96px;vertical-align:top;">${label}</td>
                  <td style="padding:10px 0;${last ? '' : 'border-bottom:1px solid #eef0f3;'}font-size:14px;color:#0f172a;font-weight:500;vertical-align:top;">${value}</td>
                </tr>`

  const checkItem = (text: string): string => `
                <tr>
                  <td style="padding:6px 0;width:26px;vertical-align:top;">
                    <span style="display:inline-block;width:16px;height:16px;border:1.5px solid #cbd5e1;border-radius:4px;"></span>
                  </td>
                  <td style="padding:6px 0;font-size:14px;color:#475569;line-height:1.5;">${text}</td>
                </tr>`

  const html = `<!DOCTYPE html>
<html lang="${isEs ? 'es' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.title}</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 1px 3px rgba(0,0,0,0.06);">

          <!-- Header with INTERNAL badge -->
          <tr>
            <td style="padding:22px 32px;border-bottom:1px solid #eef0f3;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    <img src="${LOGO_URL}" alt="Syntra" width="118" style="display:block;max-width:118px;" />
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="display:inline-block;border:1px solid #e0b13a;color:#b7791f;font-size:11px;font-weight:600;letter-spacing:0.08em;padding:5px 11px;border-radius:6px;text-transform:uppercase;">${t.internal}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 32px 32px 32px;">

              <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#0f172a;line-height:1.3;">${t.newBooking}: ${nameEsc}</h1>
              <p style="margin:0 0 24px 0;font-size:14px;line-height:1.6;color:#475569;">${t.scheduledFor}</p>

              <!-- Client info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border:1px solid #eef0f3;border-radius:10px;">
                <tr>
                  <td style="padding:18px 24px 20px 24px;">
                    <p style="margin:0 0 6px 0;font-size:11px;font-weight:600;letter-spacing:0.09em;color:#2563eb;text-transform:uppercase;">${t.clientInfo}</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${infoRow(t.nameLabel, nameEsc)}
                      ${infoRow(t.emailLabel, `<a href="mailto:${emailEsc}" style="color:#2563eb;text-decoration:none;">${emailEsc}</a>`)}
                      ${infoRow(t.companyLabel, companyEsc)}
                      ${infoRow(t.dateLabel, displayDate)}
                      ${infoRow(t.timeLabel, displayTime, !showClientTz)}
                      ${showClientTz ? infoRow(t.timezoneLabel, escapeHtml(clientTzPretty)) : ''}
                      ${showClientTz ? infoRow(t.localTimeLabel, escapeHtml(clientDisplayTime || ''), true) : ''}
                    </table>
                  </td>
                </tr>
              </table>

              ${
                message && message.trim()
                  ? `
              <!-- What they're trying to fix -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;background-color:#f8fafc;border:1px solid #eef0f3;border-left:3px solid #2563eb;border-radius:8px;">
                <tr>
                  <td style="padding:16px 22px;">
                    <p style="margin:0 0 8px 0;font-size:11px;font-weight:600;letter-spacing:0.09em;color:#2563eb;text-transform:uppercase;">${t.whatFix}</p>
                    <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;font-style:italic;white-space:pre-wrap;">&ldquo;${escapeHtml(message)}&rdquo;</p>
                  </td>
                </tr>
              </table>`
                  : ''
              }

              <!-- Before the call -->
              <p style="margin:28px 0 8px 0;font-size:15px;font-weight:600;color:#0f172a;">${t.beforeCall}</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${t.checklist.map(checkItem).join('')}
              </table>

              <!-- Actions: compact text links on one row -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:26px;border-top:1px solid #eef0f3;">
                <tr>
                  <td align="center" style="padding-top:18px;">
                    <a href="${calendarHref}" style="font-size:14px;color:#2563eb;text-decoration:none;font-weight:600;">${t.openCalendar}</a><span style="font-size:14px;color:#cbd5e1;">&nbsp;&middot;&nbsp;</span><a href="mailto:${emailEsc}" style="font-size:14px;color:#2563eb;text-decoration:none;font-weight:600;">${t.replyClient}</a>${meetHref ? `<span style="font-size:14px;color:#cbd5e1;">&nbsp;&middot;&nbsp;</span><a href="${meetHref}" style="font-size:14px;color:#2563eb;text-decoration:none;font-weight:600;">${t.joinMeeting}</a>` : ''}
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const pdfAttachment = contactData ? await buildContactPdfAttachment(contactData) : null

  await transporter.sendMail({
    from: `"Syntra Booking" <${FROM_EMAIL}>`,
    to: process.env.CONTACT_EMAIL || 'hello@syntra.build',
    replyTo: email,
    subject: `[${isEs ? 'Reserva' : 'Booking'}] ${company} - ${displayDate} ${displayTime}`,
    html,
    attachments: pdfAttachment ? [pdfAttachment] : undefined,
  })
}

export async function sendCancellationEmail(params: CancellationEmailParams): Promise<void> {
  const { name, email, eventDate, locale } = params
  const isEs = locale === 'es'

  const displayDate = eventDate
    ? new Date(eventDate).toLocaleDateString(isEs ? 'es-ES' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: BOOKING_CONFIG.timezone,
      })
    : isEs
      ? 'tu sesion programada'
      : 'your scheduled session'

  const t = isEs
    ? {
        heading: 'Sesion Cancelada',
        greeting: `Hola ${escapeHtml(name.split(' ')[0])},`,
        body: `Tu sesion programada para <strong>${displayDate}</strong> ha sido cancelada.`,
        cta: `Si deseas reservar una nueva sesion, visita <a href="${SITE_URL}" style="color: #5b9cf6;">syntra.build</a>.`,
        button: 'Reservar Nueva Sesion',
        subject: 'Sesion Cancelada - Syntra',
      }
    : {
        heading: 'Session Cancelled',
        greeting: `Hi ${escapeHtml(name.split(' ')[0])},`,
        body: `Your session scheduled for <strong>${displayDate}</strong> has been cancelled.`,
        cta: `If you'd like to book a new session, visit <a href="${SITE_URL}" style="color: #5b9cf6;">syntra.build</a>.`,
        button: 'Book a New Session',
        subject: 'Session Cancelled - Syntra',
      }

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #1a1a1a; color: #f7f7f7; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="font-size: 20px; font-weight: 600; margin: 0; color: #f7f7f7;">${t.heading}</h1>
      </div>

      <div style="background: #252525; border: 1px solid rgba(255,255,255,0.09); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <p style="margin: 0 0 8px 0; font-size: 14px;">${t.greeting}</p>
        <p style="margin: 0 0 8px 0; font-size: 14px;">${t.body}</p>
        <p style="margin: 0; font-size: 14px;">${t.cta}</p>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${SITE_URL}" style="display: inline-block; background: #5b9cf6; color: #fff; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-size: 14px; font-weight: 500;">${t.button}</a>
      </div>
    </div>
  `

  await transporter.sendMail({
    from: `"Syntra Notifications" <${FROM_EMAIL}>`,
    to: email,
    subject: t.subject,
    html,
  })
}

// --- Helper functions ---

function buildConfirmationHtml(params: {
  name: string
  company: string
  displayDate: string
  displayTime: string
  duration: string
  addToCalendarUrl: string
  outlookCalendarUrl: string
  icsDownloadUrl: string
  meetLink: string
  rescheduleUrl: string
  cancelUrl: string
  isEs: boolean
  rescheduled?: boolean
  previousDisplayDate?: string
  previousDisplayTime?: string
}): string {
  const { name, company, displayDate, displayTime, duration, addToCalendarUrl, outlookCalendarUrl, icsDownloadUrl, meetLink, rescheduleUrl, cancelUrl, isEs, rescheduled, previousDisplayDate, previousDisplayTime } = params
  const firstName = escapeHtml(name.split(' ')[0])
  const companyEsc = escapeHtml(company)
  const href = addToCalendarUrl.replace(/&/g, '&amp;')
  const outlookHref = outlookCalendarUrl.replace(/&/g, '&amp;')
  // Apple Calendar (and other desktop calendar apps) have no hosted "add event"
  // web UI like Google/Outlook. Instead we link to our .ics endpoint over plain
  // https; because that response is served as `text/calendar` inline, macOS/iOS
  // open the event directly in Apple Calendar with an "Add event" prompt.
  // (webcal:// is a subscription protocol and gets rewritten to https by many
  // mail clients, so we avoid it here.)
  const appleHref = icsDownloadUrl.replace(/&/g, '&amp;')
  const meetHref = meetLink ? meetLink.replace(/&/g, '&amp;') : ''
  const rescheduleHref = rescheduleUrl.replace(/&/g, '&amp;')
  const cancelHref = cancelUrl.replace(/&/g, '&amp;')

  const t = isEs
    ? {
        title: rescheduled ? 'Sesión reprogramada - Syntra' : 'Sesión confirmada - Syntra',
        heading: rescheduled ? `Sesión reprogramada, ${firstName}.` : `Reserva confirmada, ${firstName}.`,
        intro: rescheduled
          ? `Tu sesión de estrategia con Syntra Systems ha sido reprogramada. Los nuevos detalles están a continuación.`
          : `Tu sesión de estrategia con Syntra Systems está confirmada. Dedicaremos ${duration} a mapear tus operaciones e identificar las oportunidades de mayor impacto para tu negocio.`,
        sessionDetails: 'Detalles de la Sesión',
        dateLabel: 'Fecha',
        timeLabel: 'Hora',
        formatLabel: 'Formato',
        formatValue: meetHref
          ? `<a href="${meetHref}" style="color:#2563eb;text-decoration:none;">Google Meet</a>`
          : 'Videollamada — enlace por enviar',
        durationLabel: 'Duración',
        companyLabel: 'Empresa',
        whatToExpect: 'Qué esperar',
        expect: [
          'Una revisión de tus herramientas, flujos de trabajo y estructura de equipo actuales',
          'Identificación de tus mayores puntos de fricción operativa',
          'Un primer vistazo a cómo se vería un sistema Syntra para ti',
          'Una evaluación honesta de compatibilidad y un plan claro de próximos pasos',
        ],
        addToCalendar: 'Añadir al calendario',
        googleCalendar: 'Google Calendar',
        outlook: 'Outlook',
        appleOther: 'Apple Calendar',
        joinLabel: 'Para unirse a la llamada',
        joinMeet: 'Google Meet',
        rescheduleBtn: 'Reprogramar',
        cancelBtn: 'Cancelar',
        reschedulePrompt: '¿Necesitas reprogramar?',
        cancelPrompt: '¿Deseas cancelar?',
        orWriteUs: 'o escríbenos a',
      }
    : {
        title: rescheduled ? 'Session rescheduled - Syntra' : 'Session confirmed - Syntra',
        heading: rescheduled ? `Session rescheduled, ${firstName}.` : `You're booked, ${firstName}.`,
        intro: rescheduled
          ? `Your strategy session with Syntra Systems has been rescheduled. Updated details below.`
          : `Your strategy session with Syntra Systems is confirmed. We'll spend ${duration} mapping your operations and identifying the highest-leverage opportunities for your business.`,
        sessionDetails: 'Session Details',
        dateLabel: 'Date',
        timeLabel: 'Time',
        formatLabel: 'Format',
        formatValue: meetHref
          ? `<a href="${meetHref}" style="color:#2563eb;text-decoration:none;">Google Meet</a>`
          : 'Video call — link to follow',
        durationLabel: 'Duration',
        companyLabel: 'Company',
        whatToExpect: 'What to expect',
        expect: [
          'A review of your current tools, workflows, and team structure',
          'Identification of your highest-friction operational gaps',
          'A preliminary look at what a Syntra system could look like for you',
          'Honest assessment of fit and a clear outline of next steps',
        ],
        addToCalendar: 'Add to Calendar',
        googleCalendar: 'Google Calendar',
        outlook: 'Outlook',
        appleOther: 'Apple Calendar',
        joinLabel: 'To join the call',
        joinMeet: 'Google Meet',
        rescheduleBtn: 'Reschedule',
        cancelBtn: 'Cancel',
        reschedulePrompt: 'Need to reschedule?',
        cancelPrompt: 'Need to cancel?',
        orWriteUs: 'or write to us at',
      }

  const detailRow = (label: string, value: string, last = false): string => `
                <tr>
                  <td style="padding:10px 0;${last ? '' : 'border-bottom:1px solid #eef0f3;'}font-size:13px;color:#94a3b8;width:100px;vertical-align:top;">${label}</td>
                  <td style="padding:10px 0;${last ? '' : 'border-bottom:1px solid #eef0f3;'}font-size:14px;color:#0f172a;font-weight:500;vertical-align:top;">${value}</td>
                </tr>`

  const expectRow = (text: string): string => `
                <tr>
                  <td style="padding:5px 0;width:20px;vertical-align:top;">
                    <span style="display:inline-block;width:7px;height:7px;margin-top:7px;background-color:#2563eb;border-radius:50%;"></span>
                  </td>
                  <td style="padding:5px 0;font-size:14px;color:#475569;line-height:1.5;">${text}</td>
                </tr>`

  return `<!DOCTYPE html>
<html lang="${isEs ? 'es' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.title}</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 1px 3px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="padding:26px 40px 22px 40px;border-bottom:1px solid #eef0f3;">
              <img src="${LOGO_URL}" alt="Syntra" width="128" style="display:block;max-width:128px;" />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:34px 40px 40px 40px;">

              <!-- Check circle -->
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="56" height="56" align="center" valign="middle" style="background-color:#eaf1fe;border-radius:28px;">
                    <span style="color:#2563eb;font-size:26px;line-height:56px;">&#10003;</span>
                  </td>
                </tr>
              </table>

              <h1 style="margin:24px 0 12px 0;font-size:26px;font-weight:700;color:#0f172a;line-height:1.25;">${t.heading}</h1>
              <p style="margin:0 0 28px 0;font-size:15px;line-height:1.65;color:#475569;">${t.intro}</p>

              <!-- Session details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border:1px solid #eef0f3;border-radius:10px;">
                <tr>
                  <td style="padding:18px 24px 20px 24px;">
                    <p style="margin:0 0 8px 0;font-size:11px;font-weight:600;letter-spacing:0.09em;color:#2563eb;text-transform:uppercase;">${t.sessionDetails}</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${detailRow(t.dateLabel, displayDate + (rescheduled && previousDisplayDate ? ` <span style="color:#94a3b8;text-decoration:line-through;font-weight:400;">${previousDisplayDate}</span>` : ''))}
                      ${detailRow(t.timeLabel, displayTime + (rescheduled && previousDisplayTime ? ` <span style="color:#94a3b8;text-decoration:line-through;font-weight:400;">${previousDisplayTime}</span>` : ''))}
                      ${detailRow(t.formatLabel, t.formatValue)}
                      ${detailRow(t.durationLabel, duration)}
                      ${detailRow(t.companyLabel, companyEsc, true)}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- What to expect -->
              <p style="margin:30px 0 10px 0;font-size:15px;font-weight:600;color:#0f172a;">${t.whatToExpect}</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${t.expect.map(expectRow).join('')}
              </table>

              <!-- Join the call (Google Meet link first, clearly labelled) -->
              ${
                meetHref
                  ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                <tr>
                  <td align="center">
                    <span style="font-size:13px;color:#94a3b8;">${t.joinLabel}: </span><a href="${meetHref}" style="font-size:13px;color:#2563eb;text-decoration:underline;font-weight:600;">${t.joinMeet}</a>
                  </td>
                </tr>
              </table>`
                  : ''
              }

              <!-- Add to calendar (provider links + universal .ics fallback) -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">
                <tr>
                  <td align="center">
                    <span style="font-size:12px;color:#94a3b8;">${t.addToCalendar}: </span><a href="${href}" style="font-size:12px;color:#2563eb;text-decoration:underline;">${t.googleCalendar}</a><span style="font-size:12px;color:#cbd5e1;"> &middot; </span><a href="${outlookHref}" style="font-size:12px;color:#2563eb;text-decoration:underline;">${t.outlook}</a><span style="font-size:12px;color:#cbd5e1;"> &middot; </span><a href="${appleHref}" style="font-size:12px;color:#2563eb;text-decoration:underline;">${t.appleOther}</a>
                  </td>
                </tr>
              </table>

              <!-- Manage: reschedule (with email) then cancel, each on its own line -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:26px;border-top:1px solid #eef0f3;">
                <tr>
                  <td align="center" style="padding-top:18px;">
                    <span style="font-size:13px;color:#94a3b8;">${t.reschedulePrompt} </span><a href="${rescheduleHref}" style="font-size:13px;color:#2563eb;text-decoration:underline;font-weight:600;">${t.rescheduleBtn}</a><span style="font-size:13px;color:#94a3b8;"> &middot; ${t.orWriteUs} <a href="mailto:hello@syntra.build" style="color:#2563eb;text-decoration:underline;">hello@syntra.build</a></span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:8px;">
                    <span style="font-size:13px;color:#94a3b8;">${t.cancelPrompt} </span><a href="${cancelHref}" style="font-size:13px;color:#b91c1c;text-decoration:underline;">${t.cancelBtn}</a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatGoogleCalendarDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}
