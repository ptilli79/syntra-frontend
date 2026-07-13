import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, DM_Sans } from 'next/font/google'
import { siteConfig } from '@/lib/site'
import { faqItemsEn } from '@/lib/faq'
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
  title: {
    default: 'Syntra Systems — Custom Business Operating Systems & Workflow Automation',
    template: '%s — Syntra Systems',
  },
  description:
    'Syntra designs custom business operating systems and workflow automation software that connect inventory, sales, purchasing, scheduling, CRM, customer conversations, and AI co-pilots into one intelligent platform.',
  applicationName: 'Syntra Systems',
  generator: 'v0.app',
  keywords: [
    'custom business operating system',
    'workflow automation software',
    'business operations platform',
    'inventory management software',
    'sales and purchasing software',
    'CRM integration',
    'WhatsApp Business agent',
    'AI business assistant',
    'AI co-pilot',
    'quotation builder',
    'auto repair shop software',
    'B2B software development',
    'systems integration',
  ],
  authors: [{ name: 'Ana Algernon Luján' }, { name: 'Pierpaolo Tilli' }],
  creator: 'Syntra Systems',
  publisher: 'Syntra Systems',
  alternates: {
    canonical: '/',
    languages: {
      en: '/',
      es: '/',
    },
  },
  icons: {
    icon: '/SyntraLogoTab.png',
    shortcut: '/SyntraLogoTab.png',
    apple: '/SyntraLogoTab.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'Syntra Systems',
    title: 'Syntra Systems — Custom Business Operating Systems & Workflow Automation',
    description:
      'Custom business operating systems that connect inventory, sales, purchasing, scheduling, CRM, customer conversations, and AI co-pilots into one intelligent platform.',
    url: siteConfig.url,
    locale: 'en_US',
    alternateLocale: ['es_MX'],
    images: [
      {
        url: '/logo_transparent_white.png',
        alt: 'Syntra Systems',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Syntra Systems — Custom Business Operating Systems',
    description:
      'Custom business operating systems and workflow automation that connect inventory, sales, purchasing, CRM, and AI co-pilots into one platform.',
    images: ['/logo_transparent_white.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0a0a0a',
}

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteConfig.url}/#organization`,
      name: 'Syntra Systems',
      url: siteConfig.url,
      email: siteConfig.contactEmail,
      logo: `${siteConfig.url}/logo_transparent_white.png`,
      description:
        'Syntra designs custom business operating systems and workflow automation software that connect inventory, sales, purchasing, scheduling, CRM, customer conversations, and AI co-pilots into one intelligent platform.',
      founder: [
        {
          '@type': 'Person',
          name: 'Ana Algernon Luján',
          jobTitle: 'Co-Founder & Head of People & Operations',
          sameAs: siteConfig.founderLinks.ana || undefined,
        },
        {
          '@type': 'Person',
          name: 'Pierpaolo Tilli',
          jobTitle: 'Co-Founder & Systems Architect',
          sameAs: siteConfig.founderLinks.pierpaolo || undefined,
        },
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: 'Syntra Systems',
      publisher: { '@id': `${siteConfig.url}/#organization` },
      inLanguage: ['en', 'es'],
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${siteConfig.url}/#software`,
      name: 'Syntra Systems',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
      description:
        'Custom business operating systems that synchronize inventory tracking, sales, purchasing workflows, scheduling, CRM, omnichannel customer communication (including a WhatsApp Business agent), and AI assistants.',
      publisher: { '@id': `${siteConfig.url}/#organization` },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: '297',
        highPrice: '7398',
        offerCount: '3',
        offers: [
          {
            '@type': 'Offer',
            name: 'Core Plan',
            price: '297',
            priceCurrency: 'USD',
            description: 'Real-time inventory, sales and purchase orders, and a quotation builder with live USD-to-MXN exchange rates. + $250 setup.',
          },
          {
            '@type': 'Offer',
            name: 'Pro Plan',
            price: '397',
            priceCurrency: 'USD',
            description: 'Everything in Core plus a WhatsApp Business messaging agent and an AI-powered quotation assistant. + $450 setup.',
          },
          {
            '@type': 'Offer',
            name: 'Bespoke Systems',
            price: '7398',
            priceCurrency: 'USD',
            description: 'Fully custom-architected operating system with full source code ownership. One-time, no recurring fees.',
          },
        ],
      },
    },
    {
      '@type': 'FAQPage',
      '@id': `${siteConfig.url}/#faq`,
      mainEntity: faqItemsEn.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    },
  ],
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
