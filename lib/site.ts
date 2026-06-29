export const siteConfig = {
  name: 'Syntra Systems',
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'hello@syntrasystems.com',
} as const
