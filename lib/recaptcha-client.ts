'use client'

/**
 * Client-side Google reCAPTCHA v3 loader + executor.
 *
 * The script is loaded lazily on first use so it isn't shipped to visitors who
 * never open a form. Tokens are short-lived (~2 min), so callers must execute
 * immediately before the network request they protect — not earlier in a
 * multi-step form.
 */

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void
      execute: (siteKey: string, opts: { action: string }) => Promise<string>
    }
  }
}

let scriptPromise: Promise<void> | null = null

function loadScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('reCAPTCHA can only load in the browser'))
  }
  if (!SITE_KEY) {
    return Promise.reject(new Error('NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set'))
  }
  if (window.grecaptcha) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptPromise = null
      reject(new Error('Failed to load reCAPTCHA script'))
    }
    document.head.appendChild(script)
  })
  return scriptPromise
}

/**
 * Produce a reCAPTCHA v3 token for the given action.
 *
 * Returns `null` when reCAPTCHA is not configured or fails to load. Callers
 * send whatever they get: the server skips verification when unconfigured and
 * rejects a missing token when it IS configured, so this never hard-blocks a
 * correctly-set-up production flow while staying non-fatal in local dev.
 */
export async function executeRecaptcha(action: string): Promise<string | null> {
  if (!SITE_KEY) return null
  try {
    await loadScript()
    await new Promise<void>((resolve) => window.grecaptcha!.ready(() => resolve()))
    return await window.grecaptcha!.execute(SITE_KEY, { action })
  } catch (error) {
    console.error('reCAPTCHA execution failed:', error)
    return null
  }
}

/** Header name used to carry the token to the API routes. */
export const RECAPTCHA_HEADER = 'x-recaptcha-token'
