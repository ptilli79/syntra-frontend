'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useContact } from '@/components/contact-modal'
import { useLanguage } from '@/lib/i18n'
import type { PricingTier } from '@/lib/email'

const FEATURED_INDEX = 2

// Map tier index to backend contact tier type (one per pricing card).
const TIER_TYPES: PricingTier[] = ['strategy-session', 'core', 'pro', 'bespoke']

export function Pricing() {
  const { open } = useContact()
  const { t } = useLanguage()
  const [selectedIndex, setSelectedIndex] = useState(FEATURED_INDEX)
  const tiers = t.pricing.tiers

  return (
    <section id="pricing" className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
          {t.pricing.eyebrow}
        </p>
        <h2 className="mt-5 max-w-xl text-balance font-heading text-4xl font-semibold tracking-tight md:text-5xl">
          {t.pricing.title}
        </h2>
        <p className="mt-6 max-w-xl leading-relaxed text-muted-foreground">
          {t.pricing.body}
        </p>

        <div className="mt-14 grid items-start gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier, index) => {
            const isSelected = selectedIndex === index
            const isFeatured = index === FEATURED_INDEX
            return (
              <div
                key={tier.name}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => setSelectedIndex(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelectedIndex(index)
                  }
                }}
                className={`flex cursor-pointer flex-col rounded-xl border bg-card/40 p-8 transition-all duration-200 hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                  isSelected
                    ? 'border-primary/50 ring-1 ring-primary/30'
                    : 'border-border'
                }`}
              >
                {isFeatured && (
                  <span className="mb-4 inline-flex w-fit rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-primary">
                    {t.pricing.mostCommon}
                  </span>
                )}
                <h3 className="font-heading text-lg font-semibold">{tier.name}</h3>
                <p
                  className={`mt-3 font-heading text-3xl font-semibold ${
                    isSelected ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  {tier.price}
                  {tier.priceSuffix && (
                    <span className="ml-1 text-base font-normal text-muted-foreground">
                      {tier.priceSuffix}
                    </span>
                  )}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {tier.sub}
                </p>
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                  {tier.desc}
                </p>

                <ul className="mt-6 flex flex-col gap-3">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3 text-sm">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className={`mt-0.5 size-4 shrink-0 ${
                          isSelected ? 'text-primary' : 'text-muted-foreground/60'
                        }`}
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
                      </svg>
                      <span className={isSelected ? 'text-foreground/90' : 'text-muted-foreground'}>
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="mt-8 w-full"
                  variant={isSelected ? 'default' : 'outline'}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedIndex(index)
                    // Pass a tier-qualified title (e.g. "Request Demo — Pro") so the
                    // email subject differentiates between tiers with the same CTA.
                    open(`${tier.cta} — ${tier.name}`, TIER_TYPES[index])
                  }}
                >
                  {tier.cta}
                </Button>
              </div>
            )
          })}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground">
          {t.pricing.footnote}
        </p>
      </div>
    </section>
  )
}
