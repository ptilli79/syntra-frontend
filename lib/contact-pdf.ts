import { PDFDocument, StandardFonts, rgb, type PDFFont, type RGB } from 'pdf-lib'

export interface PdfField {
  label: string
  value: string
}

export interface PdfSection {
  heading: string
  /** Label/value rows rendered as a definition list. */
  fields?: PdfField[]
  /** Free-text block (e.g. the visitor's message), word-wrapped. */
  paragraph?: string
}

export interface ContactPdfModel {
  locale: 'en' | 'es'
  documentTitle: string
  tierTitle: string
  /** Hex color (e.g. "#2563eb") used for the accent rule and tier badge. */
  tierColor: string
  /** Optional PNG logo bytes; falls back to a "SYNTRA" wordmark when absent. */
  logo?: Uint8Array
  /** Localized "Submitted: <date/time>" line rendered under the tier badge. */
  timestamp?: string
  sections: PdfSection[]
  /** Footer line repeated at the bottom of every page. */
  footer: string
}

// --- Layout constants (A4, points) ---
const PAGE_W = 595.28
const PAGE_H = 841.89
const MARGIN = 50
const CONTENT_W = PAGE_W - MARGIN * 2

// --- Colors ---
const INK = rgb(0.067, 0.094, 0.153) // #111827
const BODY = rgb(0.216, 0.255, 0.318) // #374151
const MUTED = rgb(0.42, 0.447, 0.502) // #6b7280
const RULE = rgb(0.9, 0.91, 0.925) // #e5e7eb
const WHITE = rgb(1, 1, 1)

/**
 * Standard PDF fonts use WinAnsi (CP1252) encoding, which throws on characters
 * it cannot represent (emoji, non-Latin scripts, some symbols). Normalize the
 * common typographic characters to ASCII and replace anything still outside
 * Latin-1 with "?" so free-text fields can never crash PDF generation.
 * Spanish accents (U+00A0–U+00FF) are preserved.
 */
const NORMALIZE: Record<string, string> = {
  '\u2018': "'",
  '\u2019': "'",
  '\u201A': "'",
  '\u201C': '"',
  '\u201D': '"',
  '\u201E': '"',
  '\u2013': '-',
  '\u2014': '-',
  '\u2026': '...',
  '\u2022': '*',
  '\u00A0': ' ',
  '\u200B': '',
  '\u20AC': 'EUR',
}

function sanitize(input: string): string {
  let s = input ?? ''
  for (const [from, to] of Object.entries(NORMALIZE)) {
    s = s.split(from).join(to)
  }
  let out = ''
  for (const ch of s) {
    const cp = ch.codePointAt(0) ?? 0
    if (cp === 9 || cp === 10 || cp === 13) {
      out += ' ' // wrapping is handled manually; collapse control whitespace
    } else if ((cp >= 0x20 && cp <= 0x7e) || (cp >= 0xa0 && cp <= 0xff)) {
      out += ch
    } else {
      out += '?'
    }
  }
  return out
}

function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '')
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean
  const n = parseInt(full, 16)
  if (Number.isNaN(n)) return rgb(0.145, 0.388, 0.922) // fallback: Syntra blue
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
}

/** Greedy word-wrap; breaks over-long single words character by character. */
function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = sanitize(text).split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''

  const push = (value: string) => {
    if (value) lines.push(value)
  }

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate
      continue
    }
    push(line)
    line = ''
    if (font.widthOfTextAtSize(word, size) <= maxWidth) {
      line = word
      continue
    }
    // Word alone exceeds the width — hard-break it.
    let chunk = ''
    for (const ch of word) {
      if (font.widthOfTextAtSize(chunk + ch, size) <= maxWidth) {
        chunk += ch
      } else {
        push(chunk)
        chunk = ch
      }
    }
    line = chunk
  }
  push(line)
  return lines.length ? lines : ['']
}

/**
 * Render a Syntra contact submission as a single-column PDF. Returns the raw
 * PDF bytes, ready to be attached to an email.
 */
export async function buildContactPdf(model: ContactPdfModel): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  pdf.setTitle(sanitize(model.documentTitle))
  pdf.setCreator('Syntra')
  pdf.setProducer('Syntra')

  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const accent = hexToRgb(model.tierColor)

  let page = pdf.addPage([PAGE_W, PAGE_H])
  let y = PAGE_H - MARGIN

  const newPage = () => {
    page = pdf.addPage([PAGE_W, PAGE_H])
    y = PAGE_H - MARGIN
  }
  const ensure = (space: number) => {
    if (y - space < MARGIN + 24) newPage()
  }
  const draw = (text: string, x: number, size: number, f: PDFFont, color: RGB) => {
    page.drawText(sanitize(text), { x, y, size, font: f, color })
  }

  // --- Header: logo + tier badge + submission date, then accent rule ---
  let logoImage: Awaited<ReturnType<typeof pdf.embedPng>> | undefined
  if (model.logo && model.logo.byteLength > 0) {
    try {
      logoImage = await pdf.embedPng(model.logo)
    } catch {
      logoImage = undefined
    }
  }
  if (logoImage) {
    const targetH = 26
    const scaled = logoImage.scale(targetH / logoImage.height)
    page.drawImage(logoImage, { x: MARGIN, y: y - targetH, width: scaled.width, height: targetH })
    y -= targetH + 14
  } else {
    draw('SYNTRA', MARGIN, 22, bold, INK)
    y -= 30
  }

  // --- Tier badge, directly under the logo ---
  {
    const label = sanitize(model.tierTitle)
    const size = 10
    const padX = 12
    const padY = 6
    const badgeW = bold.widthOfTextAtSize(label, size) + padX * 2
    const badgeH = size + padY * 2
    ensure(badgeH + 12)
    const bottom = y - badgeH
    page.drawRectangle({ x: MARGIN, y: bottom, width: badgeW, height: badgeH, color: accent })
    page.drawText(label, { x: MARGIN + padX, y: bottom + padY + 1, size, font: bold, color: WHITE })
    y = bottom - 16
  }

  // --- Submission date/time, directly under the badge ---
  if (model.timestamp) {
    draw(model.timestamp, MARGIN, 10, font, MUTED)
    y -= 18
  }

  // --- Spacer below the date/time (accent rule removed) ---
  y -= 22

  // --- Sections ---
  for (const section of model.sections) {
    ensure(50)
    // Section heading + underline
    draw(section.heading.toUpperCase(), MARGIN, 11, bold, INK)
    y -= 8
    page.drawRectangle({ x: MARGIN, y, width: CONTENT_W, height: 1.5, color: INK })
    y -= 18

    if (section.paragraph !== undefined) {
      for (const line of wrapText(section.paragraph, font, 11, CONTENT_W)) {
        ensure(16)
        draw(line, MARGIN, 11, font, BODY)
        y -= 16
      }
      y -= 6
    }

    for (const field of section.fields ?? []) {
      ensure(34)
      draw(field.label.toUpperCase(), MARGIN, 8, font, MUTED)
      y -= 14
      for (const line of wrapText(field.value || '-', font, 12, CONTENT_W)) {
        ensure(16)
        draw(line, MARGIN, 12, font, INK)
        y -= 16
      }
      y -= 6
      page.drawRectangle({ x: MARGIN, y: y + 2, width: CONTENT_W, height: 0.5, color: RULE })
      y -= 12
    }

    y -= 8
  }

  // --- Footer on every page ---
  const footer = sanitize(model.footer)
  const pages = pdf.getPages()
  pages.forEach((p, index) => {
    p.drawText(footer, { x: MARGIN, y: 30, size: 8, font, color: MUTED })
    const label = `${index + 1} / ${pages.length}`
    const labelW = font.widthOfTextAtSize(label, 8)
    p.drawText(label, { x: PAGE_W - MARGIN - labelW, y: 30, size: 8, font, color: MUTED })
  })

  return pdf.save()
}
