import nodemailer from 'nodemailer'

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
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

const OPTION_LABELS: Record<string, string> = {
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
}

function mapLabels(ids: string[] | undefined): string {
  if (!ids || ids.length === 0) return 'Not specified'
  return ids.map((id) => OPTION_LABELS[id] || id).join(', ')
}

function formatTools(data: ContactFormData): string {
  const base = mapLabels(data.currentTools)
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
                <td style="color: #111827; font-size: 15px;">${value || 'Not specified'}</td>
              </tr>
            </table>
          </td>
        </tr>`
}

function getTierSpecificSection(data: ContactFormData): string {
  const common =
    detailRow('Industry', data.industry || 'Not specified') +
    detailRow('Number of employees', data.teamSize || 'Not specified')

  switch (data.tier) {
    case 'strategy-session':
      return common + detailRow('Main challenge', data.mainChallenge || 'Not specified')
    case 'core':
      return (
        common +
        detailRow('Operations to organize', mapLabels(data.coreOperations)) +
        detailRow('Current tools', formatTools(data)) +
        detailRow('Desired timeline', data.timeline || 'Not specified')
      )
    case 'pro':
      return (
        common +
        detailRow('Priority capabilities', mapLabels(data.proCapabilities)) +
        detailRow('Monthly sales / orders', data.monthlyVolume || 'Not specified')
      )
    case 'bespoke':
      return (
        common +
        detailRow('Current tools', formatTools(data)) +
        detailRow('Deployment preference', data.deployment || 'Not specified') +
        detailRow('Intended budget (one-time)', data.budgetRange || 'Not specified')
      )
    default:
      return common
  }
}

function getTierBadgeColor(tier: PricingTier): { bg: string; text: string; accent: string } {
  switch (tier) {
    case 'strategy-session':
      return { bg: '#059669', text: '#ffffff', accent: '#34d399' } // Emerald
    case 'core':
      return { bg: '#2563eb', text: '#ffffff', accent: '#60a5fa' } // Blue
    case 'pro':
      return { bg: '#7c3aed', text: '#ffffff', accent: '#a78bfa' } // Violet
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
  const tierColors = getTierBadgeColor(data.tier)
  const tierIcon = getTierIcon(data.tier)
  const tierSpecificSection = getTierSpecificSection(data)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://syntra.build'
  const logoUrl = `${siteUrl}/logo_transparent_white.png`
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Request - Syntra</title>
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
                    <h2 style="margin: 0; color: #111827; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Contact Information</h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; padding-bottom: 4px;">Name</td>
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
                        <td style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; padding-bottom: 4px;">Email</td>
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
                        <td style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; padding-bottom: 4px;">Company</td>
                      </tr>
                      <tr>
                        <td style="color: #111827; font-size: 15px;">${data.company || 'Not specified'}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Message Section -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="padding-bottom: 16px; border-bottom: 2px solid #111827;">
                    <h2 style="margin: 0; color: #111827; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">What They Want to Solve</h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 0;">
                    <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">${data.message || 'No message provided'}</p>
                  </td>
                </tr>
              </table>
              
              <!-- Tier-Specific Details Section -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom: 16px; border-bottom: 2px solid #111827;">
                    <h2 style="margin: 0; color: #111827; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Business Details</h2>
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
                    <a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(`[${data.tierTitle}] - ${data.company}`)}" style="display: block; width: 100%; padding: 14px 24px; background-color: #3b82f6; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px; text-align: center; box-sizing: border-box;">Reply to ${data.name}</a>
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
                © ${new Date().getFullYear()} Syntra Systems. Custom Business Operating Systems.
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

export async function sendContactEmail(data: ContactFormData): Promise<void> {
  const html = buildEmailHtml(data)
  
  await transporter.sendMail({
    from: `"Syntra Systems" <${process.env.SMTP_USER}>`,
    to: process.env.CONTACT_EMAIL || 'hello@syntra.build',
    replyTo: data.email,
    subject: `[${data.tierTitle}] - ${data.company}`,
    html,
  })
}
