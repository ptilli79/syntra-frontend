import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, DM_Sans } from 'next/font/google'
import { siteConfig } from '@/lib/site'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})
const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: 'Syntra Systems — Custom Business Operating Systems',
  description:
    'Syntra designs custom operating systems that connect your workflows, customer conversations, scheduling, inventory, and business data into one intelligent platform.',
  generator: 'v0.app',
  icons: {
    icon: '/SyntraLogoTab.png',
    shortcut: '/SyntraLogoTab.png',
    apple: '/SyntraLogoTab.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`dark ${spaceGrotesk.variable} ${dmSans.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
