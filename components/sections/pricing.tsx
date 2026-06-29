'use client'

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useContact } from '@/components/contact-modal'

const tiers = [
  {
    name: 'Strategy Session',
    price: 'Complimentary',
    sub: 'First Engagement',
    desc: 'A focused 60-minute session to map your current operations, identify the highest-leverage gaps, and determine whether Syntra is the right fit.',
    features: [
      'Operations audit and gap analysis',
      'Current tools and workflow review',
      'Preliminary system architecture',
      'Fit assessment and next steps',
    ],
    cta: 'Book Your Session',
    featured: false,
  },
  {
    name: 'System Design & Build',
    price: 'From $8,500',
    sub: 'One-Time Project Fee',
    desc: 'A fully custom operating system designed, integrated, and deployed for your business. Scoped to your operations — no templates, no shortcuts.',
    features: [
      'Complete discovery and system mapping',
      'Custom platform architecture',
      'Tool integrations and automations',
      'AI assistant configuration',
      'Team training and documentation',
      '30-day post-launch support',
    ],
    cta: 'Start a Project',
    featured: true,
  },
  {
    name: 'Ongoing Partnership',
    price: 'From $1,200/mo',
    sub: 'Monthly Retainer',
    desc: 'Continuous system support, optimization, and expansion as your business evolves. Your operating system grows with you.',
    features: [
      'Dedicated system support',
      'Monthly optimization review',
      'New workflow and integration builds',
      'Priority response and implementation',
      'Quarterly strategy sessions',
    ],
    cta: 'Learn More',
    featured: false,
  },
]

export function Pricing() {
  const { open } = useContact()

  return (
    <section id="pricing" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
          Fee Structure
        </p>
        <h2 className="mt-5 max-w-xl text-balance font-heading text-4xl font-semibold tracking-tight md:text-5xl">
          Transparent, project-based pricing.
        </h2>
        <p className="mt-6 max-w-xl leading-relaxed text-muted-foreground">
          Every engagement is scoped to your operations. No subscriptions to
          software you won&apos;t use — only the system your business actually
          needs.
        </p>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col rounded-xl border bg-card/40 p-8 ${
                tier.featured
                  ? 'border-primary/50 ring-1 ring-primary/30'
                  : 'border-border'
              }`}
            >
              {tier.featured && (
                <span className="mb-4 inline-flex w-fit rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-primary">
                  Most Common
                </span>
              )}
              <h3 className="font-heading text-lg font-semibold">{tier.name}</h3>
              <p
                className={`mt-3 font-heading text-3xl font-semibold ${
                  tier.featured ? 'text-primary' : 'text-foreground'
                }`}
              >
                {tier.price}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {tier.sub}
              </p>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                {tier.desc}
              </p>

              <ul className="mt-6 flex flex-1 flex-col gap-3">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="text-foreground/90">{feat}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="mt-8 w-full"
                variant={tier.featured ? 'default' : 'outline'}
                onClick={() => open(tier.cta)}
              >
                {tier.cta}
              </Button>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground">
          All projects begin with a complimentary Strategy Session. Final pricing
          is determined after scoping — every business is different.
        </p>
      </div>
    </section>
  )
}
