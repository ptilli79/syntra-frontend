import 'server-only'

/**
 * Server-side Google reCAPTCHA v3 verification.
 *
 * v3 is score-based and invisible: the browser produces a token for a named
 * action, and this module exchanges it with Google for a score (0.0–1.0).
 * Requests below {@link SCORE_THRESHOLD} are treated as likely bots.
 *
 * Graceful degradation: if `RECAPTCHA_SECRET_KEY` is not set (e.g. local dev),
 * verification is skipped so the app keeps working without keys. In production
 * you MUST set the key — an unset key means no bot protection.
 */

const SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY
const SCORE_THRESHOLD = Number(process.env.RECAPTCHA_SCORE_THRESHOLD ?? '0.5')
const VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'

export interface RecaptchaResult {
  success: boolean
  /** True when verification was skipped because no secret key is configured. */
  skipped?: boolean
  score?: number
  reason?: 'missing-token' | 'verification-failed' | 'action-mismatch' | 'low-score' | 'request-error'
}

interface SiteVerifyResponse {
  success: boolean
  score?: number
  action?: string
  challenge_ts?: string
  hostname?: string
  'error-codes'?: string[]
}

/**
 * Verify a reCAPTCHA v3 token.
 *
 * @param token          The token produced by `grecaptcha.execute()`.
 * @param expectedAction The action name the token was generated for; rejected
 *                       on mismatch to stop tokens being replayed across forms.
 * @param remoteIp       Optional client IP for Google's risk analysis.
 */
export async function verifyRecaptcha(
  token: string | null | undefined,
  expectedAction: string,
  remoteIp?: string,
): Promise<RecaptchaResult> {
  if (!SECRET_KEY) return { success: true, skipped: true }

  if (!token) return { success: false, reason: 'missing-token' }

  const params = new URLSearchParams({ secret: SECRET_KEY, response: token })
  if (remoteIp) params.set('remoteip', remoteIp)

  let data: SiteVerifyResponse
  try {
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      // Never cache verification calls.
      cache: 'no-store',
    })
    data = (await res.json()) as SiteVerifyResponse
  } catch (error) {
    console.error('reCAPTCHA verification request failed:', error)
    return { success: false, reason: 'request-error' }
  }

  if (!data.success) return { success: false, reason: 'verification-failed' }

  // Dev-only visibility: prints the real score so you can watch reCAPTCHA work
  // and tune RECAPTCHA_SCORE_THRESHOLD. Remove before shipping if you prefer.
  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `[reCAPTCHA] action=${expectedAction} score=${data.score} ` +
        `threshold=${SCORE_THRESHOLD} verifiedAction=${data.action}`
    )
  }

  if (data.action && data.action !== expectedAction) {
    return { success: false, reason: 'action-mismatch', score: data.score }
  }

  if (typeof data.score === 'number' && data.score < SCORE_THRESHOLD) {
    return { success: false, reason: 'low-score', score: data.score }
  }

  return { success: true, score: data.score }
}
