import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/logo'
import { siteConfig } from '@/lib/site'

export const metadata = {
  title: 'Privacy Policy — Syntra Systems',
  description: 'How Syntra Systems collects, uses, and protects your data.',
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between">
        <Link href="/" aria-label="Syntra Systems home">
          <Logo />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back home
        </Link>
      </div>

      <h1 className="mt-12 font-heading text-4xl font-semibold tracking-tight md:text-5xl">
        Privacy Policy
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated {new Date().getFullYear()}
      </p>

      <div className="mt-10 space-y-8 leading-relaxed text-muted-foreground">
        <section className="space-y-3">
          <h2 className="font-heading text-xl text-foreground">
            Information we collect
          </h2>
          <p>
            When you contact Syntra Systems through our website, we collect the
            information you provide — such as your name, work email, company, and
            the details of your inquiry. We use this solely to respond to you and
            scope potential work.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl text-foreground">
            How we use your information
          </h2>
          <p>
            Your information is used to communicate with you about your inquiry,
            schedule conversations, and deliver the services you request. We do
            not sell your personal data to third parties.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl text-foreground">Data security</h2>
          <p>
            We apply reasonable technical and organizational measures to protect
            the information you share with us. No method of transmission over the
            internet is fully secure, but we work to safeguard your data with care.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl text-foreground">Contact</h2>
          <p>
            Questions about this policy? Reach us at{' '}
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="text-primary hover:underline"
            >
              {siteConfig.contactEmail}
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  )
}
