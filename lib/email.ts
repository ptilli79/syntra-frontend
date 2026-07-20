import { readFile } from 'node:fs/promises'
import path from 'node:path'
import nodemailer from 'nodemailer'
import { buildContactPdf, type ContactPdfModel } from './contact-pdf'

export type PricingTier = 'strategy-session' | 'core' | 'pro' | 'bespoke'

export interface ContactFormData {
  // Step 1 - Common fields
  name: string
  email: string
  company: string
  message: string

  // Step 2 - Tier context
  tier: PricingTier
  tierTitle: string

  // Common step 2
  industry?: string
  teamSize?: string

  // Strategy Session
  mainChallenge?: string

  // Core
  coreOperations?: string[]

  // Pro
  proCapabilities?: string[]
  monthlyVolume?: string

  // Bespoke
  deployment?: string
  budgetRange?: string

  // Shared (Core + Bespoke)
  currentTools?: string[]
  currentToolsOther?: string
  timeline?: string

  // Request metadata (not part of the form itself)
  locale?: 'en' | 'es'
  acknowledge?: boolean
}

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export type EmailLocale = 'en' | 'es'

const OPTION_LABELS: Record<EmailLocale, Record<string, string>> = {
  en: {
    // Current tools
    excel: 'Excel / Spreadsheets',
    inhouse: 'In-house / custom software',
    commercial: 'Commercial software (CRM/ERP/POS)',
    whatsapp: 'WhatsApp / Messaging',
    manual: 'Pen & paper / Manual',
    other: 'Other',
    none: 'None',
    // Core operations
    inventory: 'Inventory',
    sales: 'Sales',
    purchasing: 'Purchasing',
    customers: 'Customers',
    quotations: 'Quotations',
    // Pro capabilities
    aiAssistant: 'AI assistant',
    whatsappAgent: 'WhatsApp messaging',
    analytics: 'Advanced analytics',
    rotation: 'Inventory rotation',
    autoQuotations: 'Automated quotations',
  },
  es: {
    // Current tools
    excel: 'Excel / Hojas de calculo',
    inhouse: 'Software interno / personalizado',
    commercial: 'Software comercial (CRM/ERP/POS)',
    whatsapp: 'WhatsApp / Mensajeria',
    manual: 'Papel y lapiz / Manual',
    other: 'Otro',
    none: 'Ninguno',
    // Core operations
    inventory: 'Inventario',
    sales: 'Ventas',
    purchasing: 'Compras',
    customers: 'Clientes',
    quotations: 'Cotizaciones',
    // Pro capabilities
    aiAssistant: 'Asistente de IA',
    whatsappAgent: 'Mensajeria por WhatsApp',
    analytics: 'Analitica avanzada',
    rotation: 'Rotacion de inventario',
    autoQuotations: 'Cotizaciones automatizadas',
  },
}

export const CONTACT_EMAIL_COPY: Record<
  EmailLocale,
  {
    title: string
    contactInfo: string
    name: string
    email: string
    company: string
    whatToSolve: string
    businessDetails: string
    replyTo: (n: string) => string
    tagline: string
    notSpecified: string
    noMessage: string
    fields: Record<string, string>
  }
> = {
  en: {
    title: 'New Contact Request - Syntra',
    contactInfo: 'Contact Information',
    name: 'Name',
    email: 'Email',
    company: 'Company',
    whatToSolve: 'What They Want to Solve',
    businessDetails: 'Business Details',
    replyTo: (n) => `Reply to ${n}`,
    tagline: 'Custom Business Operating Systems',
    notSpecified: 'Not specified',
    noMessage: 'No message provided',
    fields: {
      industry: 'Industry',
      teamSize: 'Number of employees',
      mainChallenge: 'Main challenge',
      coreOperations: 'Operations to organize',
      currentTools: 'Current tools',
      timeline: 'Desired timeline',
      proCapabilities: 'Priority capabilities',
      monthlyVolume: 'Monthly sales / orders',
      deployment: 'Deployment preference',
      budgetRange: 'Intended budget (one-time)',
    },
  },
  es: {
    title: 'Nueva Solicitud de Contacto - Syntra',
    contactInfo: 'Informacion de Contacto',
    name: 'Nombre',
    email: 'Correo',
    company: 'Empresa',
    whatToSolve: 'Lo Que Quieren Resolver',
    businessDetails: 'Detalles del Negocio',
    replyTo: (n) => `Responder a ${n}`,
    tagline: 'Sistemas Operativos de Negocio a la Medida',
    notSpecified: 'No especificado',
    noMessage: 'No se proporciono mensaje',
    fields: {
      industry: 'Industria',
      teamSize: 'Numero de empleados',
      mainChallenge: 'Principal desafio',
      coreOperations: 'Operaciones a organizar',
      currentTools: 'Herramientas actuales',
      timeline: 'Plazo deseado',
      proCapabilities: 'Capacidades prioritarias',
      monthlyVolume: 'Ventas / pedidos mensuales',
      deployment: 'Preferencia de implementacion',
      budgetRange: 'Presupuesto previsto (unico)',
    },
  },
}

function mapLabels(ids: string[] | undefined, locale: EmailLocale): string {
  if (!ids || ids.length === 0) return CONTACT_EMAIL_COPY[locale].notSpecified
  return ids.map((id) => OPTION_LABELS[locale][id] || id).join(', ')
}

function formatTools(data: ContactFormData, locale: EmailLocale): string {
  const base = mapLabels(data.currentTools, locale)
  if (data.currentTools?.includes('other') && data.currentToolsOther?.trim()) {
    return `${base} (${data.currentToolsOther.trim()})`
  }
  return base
}

function detailRow(label: string, value: string): string {
  return `
        <tr>
          <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; padding-bottom: 4px;">${label}</td>
              </tr>
              <tr>
                <td style="color: #111827; font-size: 15px;">${value}</td>
              </tr>
            </table>
          </td>
        </tr>`
}

export interface ContactFieldRow {
  label: string
  value: string
}

export function resolveEmailLocale(data: ContactFormData): EmailLocale {
  return data.locale === 'es' ? 'es' : 'en'
}

/**
 * Ordered label/value pairs for the tier-specific "business details" section.
 * Shared by the notification email and the PDF attachment so the two can never
 * drift out of sync.
 */
export function getContactFieldRows(
  data: ContactFormData,
  locale: EmailLocale,
): ContactFieldRow[] {
  const copy = CONTACT_EMAIL_COPY[locale]
  const f = copy.fields
  const ns = copy.notSpecified
  const rows: ContactFieldRow[] = [
    { label: f.industry, value: data.industry || ns },
    { label: f.teamSize, value: data.teamSize || ns },
  ]

  switch (data.tier) {
    case 'strategy-session':
      rows.push({ label: f.mainChallenge, value: data.mainChallenge || ns })
      break
    case 'core':
      rows.push(
        { label: f.coreOperations, value: mapLabels(data.coreOperations, locale) },
        { label: f.currentTools, value: formatTools(data, locale) },
        { label: f.timeline, value: data.timeline || ns },
      )
      break
    case 'pro':
      rows.push(
        { label: f.proCapabilities, value: mapLabels(data.proCapabilities, locale) },
        { label: f.monthlyVolume, value: data.monthlyVolume || ns },
      )
      break
    case 'bespoke':
      rows.push(
        { label: f.currentTools, value: formatTools(data, locale) },
        { label: f.deployment, value: data.deployment || ns },
        { label: f.budgetRange, value: data.budgetRange || ns },
      )
      break
  }

  return rows
}

function getTierSpecificSection(data: ContactFormData, locale: EmailLocale): string {
  return getContactFieldRows(data, locale)
    .map((row) => detailRow(row.label, row.value))
    .join('')
}

export function getTierBadgeColor(tier: PricingTier): { bg: string; text: string; accent: string } {
  switch (tier) {
    case 'strategy-session':
      return { bg: '#059669', text: '#ffffff', accent: '#34d399' } // Emerald
    case 'core':
      return { bg: '#2563eb', text: '#ffffff', accent: '#60a5fa' } // Blue
    case 'pro':
      return { bg: '#2563eb', text: '#ffffff', accent: '#60a5fa' } // Syntra blue
    case 'bespoke':
      return { bg: '#0f172a', text: '#ffffff', accent: '#64748b' } // Slate
    default:
      return { bg: '#6b7280', text: '#ffffff', accent: '#9ca3af' }
  }
}

function getTierIcon(tier: PricingTier): string {
  switch (tier) {
    case 'strategy-session':
      return '🎯' // Target
    case 'core':
      return '📦' // Package
    case 'pro':
      return '⚡' // Lightning
    case 'bespoke':
      return '🛠️' // Tools
    default:
      return '📧'
  }
}

export function buildEmailHtml(data: ContactFormData): string {
  const locale: EmailLocale = data.locale === 'es' ? 'es' : 'en'
  const copy = CONTACT_EMAIL_COPY[locale]
  const tierColors = getTierBadgeColor(data.tier)
  const tierIcon = getTierIcon(data.tier)
  const tierSpecificSection = getTierSpecificSection(data, locale)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://syntra.build'
  const logoUrl = `${siteUrl}/logo_transparent_white.png`
  
  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${copy.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #0a0a0a 0%, #171717 50%, #0a0a0a 100%); padding: 28px 40px 24px 40px; border-bottom: 3px solid ${tierColors.accent};">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <!-- Logo Row -->
                <tr>
                  <td align="center" style="padding: 0; margin: 0; line-height: 0;">
                    <img src="${logoUrl}" alt="Syntra" width="200" style="display: block; max-width: 200px;" />
                  </td>
                </tr>
                <!-- Tier Badge Row -->
                <tr>
                  <td align="center" style="padding-top: 16px;">
                    <table cellpadding="0" cellspacing="0" border="0" style="background-color: ${tierColors.bg}; border-radius: 24px; overflow: hidden;">
                      <tr>
                        <td style="padding: 10px 20px; white-space: nowrap;">
                          <span style="color: ${tierColors.text}; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap;">
                            ${tierIcon} ${data.tierTitle}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              
              <!-- Contact Info Section -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="padding-bottom: 16px; border-bottom: 2px solid #111827;">
                    <h2 style="margin: 0; color: #111827; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">${copy.contactInfo}</h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; padding-bottom: 4px;">${copy.name}</td>
                      </tr>
                      <tr>
                        <td style="color: #111827; font-size: 15px; font-weight: 500;">${data.name}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; padding-bottom: 4px;">${copy.email}</td>
                      </tr>
                      <tr>
                        <td>
                          <a href="mailto:${data.email}" style="color: #3b82f6; font-size: 15px; text-decoration: none;">${data.email}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; padding-bottom: 4px;">${copy.company}</td>
                      </tr>
                      <tr>
                        <td style="color: #111827; font-size: 15px;">${data.company || copy.notSpecified}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Message Section -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="padding-bottom: 16px; border-bottom: 2px solid #111827;">
                    <h2 style="margin: 0; color: #111827; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">${copy.whatToSolve}</h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 0;">
                    <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">${data.message || copy.noMessage}</p>
                  </td>
                </tr>
              </table>
              
              <!-- Tier-Specific Details Section -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom: 16px; border-bottom: 2px solid #111827;">
                    <h2 style="margin: 0; color: #111827; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">${copy.businessDetails}</h2>
                  </td>
                </tr>
                ${tierSpecificSection}
              </table>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(`[${data.tierTitle}] - ${data.company}`)}" style="display: block; width: 100%; padding: 14px 24px; background-color: #3b82f6; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px; text-align: center; box-sizing: border-box;">${copy.replyTo(data.name)}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
        
        <!-- Email Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; padding: 24px;">
          <tr>
            <td align="center">
              <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                © ${new Date().getFullYear()} Syntra Systems. ${copy.tagline}.
              </p>
            </td>
          </tr>
        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>`
}

const PDF_COPY: Record<EmailLocale, { submittedAt: string; filePrefix: string }> = {
  en: { submittedAt: 'Submitted', filePrefix: 'syntra-contact' },
  es: { submittedAt: 'Enviado', filePrefix: 'syntra-contacto' },
}

// The PDF logo is loaded once per server instance and reused. Prefer the bundled
// file (fast, offline); fall back to fetching the publicly served asset.
let logoBytesPromise: Promise<Uint8Array | undefined> | null = null

async function loadContactLogo(): Promise<Uint8Array | undefined> {
  if (!logoBytesPromise) {
    logoBytesPromise = (async () => {
      try {
        const file = path.join(process.cwd(), 'public', 'logo_transparent_black.png')
        return new Uint8Array(await readFile(file))
      } catch {
        try {
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://syntra.build'
          const res = await fetch(`${siteUrl}/logo_transparent_black.png`)
          if (res.ok) return new Uint8Array(await res.arrayBuffer())
        } catch {
          /* logo is optional — fall through to the text wordmark */
        }
        return undefined
      }
    })()
  }
  return logoBytesPromise
}

function formatSubmittedAt(locale: EmailLocale): string {
  const loc = locale === 'es' ? 'es-ES' : 'en-US'
  const stamp = new Intl.DateTimeFormat(loc, {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'America/New_York',
  }).format(new Date())
  return `${stamp} ET`
}

function buildContactPdfModel(data: ContactFormData, logo?: Uint8Array): ContactPdfModel {
  const locale = resolveEmailLocale(data)
  const copy = CONTACT_EMAIL_COPY[locale]
  const pdfCopy = PDF_COPY[locale]
  const tierColors = getTierBadgeColor(data.tier)

  return {
    locale,
    logo,
    documentTitle: copy.title,
    tierTitle: data.tierTitle,
    tierColor: tierColors.bg,
    timestamp: `${pdfCopy.submittedAt}: ${formatSubmittedAt(locale)}`,
    footer: `\u00A9 ${new Date().getFullYear()} Syntra Systems. ${copy.tagline}.`,
    sections: [
      {
        heading: copy.contactInfo,
        fields: [
          { label: copy.name, value: data.name || copy.notSpecified },
          { label: copy.email, value: data.email || copy.notSpecified },
          { label: copy.company, value: data.company || copy.notSpecified },
        ],
      },
      {
        heading: copy.whatToSolve,
        paragraph: data.message?.trim() || copy.noMessage,
      },
      {
        heading: copy.businessDetails,
        fields: getContactFieldRows(data, locale),
      },
    ],
  }
}

function buildContactPdfFilename(data: ContactFormData, locale: EmailLocale): string {
  const base = (data.company || data.name || 'lead')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
  return `${PDF_COPY[locale].filePrefix}-${base || 'lead'}.pdf`
}

// Build the full-submission PDF as a mail attachment. Returns null if the PDF
// can't be generated — a PDF failure must never block the email itself.
// Exported so the booking flow can attach the same PDF to its notification.
export async function buildContactPdfAttachment(
  data: ContactFormData
): Promise<{ filename: string; content: Buffer; contentType: string } | null> {
  const locale = resolveEmailLocale(data)
  try {
    const logo = await loadContactLogo()
    const pdfBytes = await buildContactPdf(buildContactPdfModel(data, logo))
    return {
      filename: buildContactPdfFilename(data, locale),
      content: Buffer.from(pdfBytes),
      contentType: 'application/pdf',
    }
  } catch (pdfError) {
    console.error('Failed to build contact PDF attachment:', pdfError)
    return null
  }
}

export async function sendContactEmail(data: ContactFormData): Promise<void> {
  const html = buildEmailHtml(data)
  const attachment = await buildContactPdfAttachment(data)

  await transporter.sendMail({
    from: `"Syntra Systems" <${process.env.SMTP_USER}>`,
    to: process.env.CONTACT_EMAIL || 'hello@syntra.build',
    replyTo: data.email,
    subject: `[${data.tierTitle}] - ${data.company}`,
    html,
    attachments: attachment ? [attachment] : undefined,
  })
}

const ACK_COPY = {
  en: {
    subject: "We've received your details — Syntra",
    heading: (firstName: string) => `Thank you, ${firstName}`,
    body:
      'Thanks for sharing your details with Syntra. We\'ll be reviewing your case. Expect a response from us with our assessment and recommendations.',
    urgent: 'If anything is time-sensitive, just reply to this email and we\'ll get back to you sooner.',
    signature: '— The Syntra Team',
    schedulePrompt: 'Prefer to talk sooner?',
    scheduleBtn: 'Schedule a Call',
    orWriteUs: 'or write to us at',
    footer: 'Custom Business Operating Systems',
  },
  es: {
    subject: 'Hemos recibido tus datos — Syntra',
    heading: (firstName: string) => `Gracias, ${firstName}`,
    body:
      'Gracias por compartir tus datos con Syntra. Estaremos revisando tu caso. Espera una respuesta de nuestra parte con nuestra evaluación y recomendaciones.',
    urgent: 'Si algo es urgente, responde a este correo y te atenderemos antes.',
    signature: '— El equipo de Syntra',
    schedulePrompt: '¿Prefieres hablar antes?',
    scheduleBtn: 'Agendar Llamada',
    orWriteUs: 'o escríbenos a',
    footer: 'Sistemas Operativos de Negocio a la Medida',
  },
} as const

export function buildAcknowledgmentHtml(data: ContactFormData): string {
  const locale = data.locale === 'es' ? 'es' : 'en'
  const copy = ACK_COPY[locale]
  const firstName = (data.name || '').trim().split(/\s+/)[0] || (locale === 'es' ? 'ahí' : 'there')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://syntra.build'
  const logoUrl = `${siteUrl}/logo_transparent_black.png`

  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${copy.subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">

          <!-- Header with Logo -->
          <tr>
            <td style="background-color: #e5e7eb; padding: 24px 40px; border-bottom: 3px solid #2563eb; vertical-align: middle;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" valign="middle" style="padding: 0; margin: 0; line-height: 0;">
                    <img src="${logoUrl}" alt="Syntra" width="200" height="41" style="display: block; width: 200px; height: auto; max-width: 200px; vertical-align: middle;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 16px 0; color: #111827; font-size: 22px; font-weight: 700;">${copy.heading(firstName)}</h1>
              <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">${copy.body}</p>
              <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">${copy.urgent}</p>
              <p style="margin: 0 0 28px 0; color: #111827; font-size: 15px; font-weight: 600;">${copy.signature}</p>

              <!-- Schedule CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e7eb;">
                <tr>
                  <td align="center" style="padding-top:20px;">
                    <span style="font-size:13px;color:#6b7280;">${copy.schedulePrompt} </span><a href="${siteUrl}?schedule=1" style="font-size:13px;color:#2563eb;text-decoration:underline;font-weight:600;">${copy.scheduleBtn}</a><span style="font-size:13px;color:#6b7280;"> &middot; ${copy.orWriteUs} <a href="mailto:hello@syntra.build" style="color:#2563eb;text-decoration:underline;">hello@syntra.build</a></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!-- Email Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; padding: 24px;">
          <tr>
            <td align="center">
              <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                © ${new Date().getFullYear()} Syntra Systems. ${copy.footer}
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendCustomerAcknowledgment(data: ContactFormData): Promise<void> {
  const locale = data.locale === 'es' ? 'es' : 'en'
  const copy = ACK_COPY[locale]
  const html = buildAcknowledgmentHtml(data)

  await transporter.sendMail({
    from: `"Syntra Notifications" <${process.env.SMTP_USER}>`,
    to: data.email,
    subject: copy.subject,
    html,
  })
}
