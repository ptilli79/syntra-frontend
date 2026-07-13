export const siteConfig = {
  name: 'Syntra Systems',
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'hello@syntra.build',
  bookingUrl:
    process.env.NEXT_PUBLIC_BOOKING_URL ?? 'https://calendar.app.google/Q6m3TVNoavMYHWmP8',
  // Verified founder profiles — strengthen E-E-A-T authority signals.
  // Leave a value empty ('') to hide that founder's LinkedIn link.
  founderLinks: {
    ana: 'https://www.linkedin.com/in/ana-algernon-lujan-818a8a64',
    pierpaolo: 'https://www.linkedin.com/in/pierpaolo-tilli-56b075113',
  },
} as const
