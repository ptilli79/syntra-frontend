'use client'

import { Button } from '@/components/ui/button'
import { useContact } from '@/components/contact-modal'
import { useLanguage } from '@/lib/i18n'

export function FinalCta() {
  const { open } = useContact()
  const { t } = useLanguage()

  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card/40 px-6 py-20 text-center md:py-28">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                'linear-gradient(to right, oklch(1 0 0 / 6%) 1px, transparent 1px), linear-gradient(to bottom, oklch(1 0 0 / 6%) 1px, transparent 1px)',
              backgroundSize: '56px 56px',
            }}
            aria-hidden
          />
          <div className="relative">
            <h2 className="mx-auto max-w-3xl text-balance font-heading text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              {t.finalCta.titleA}
              <br />
              <span className="text-muted-foreground/70">{t.finalCta.titleB}</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-pretty leading-relaxed text-muted-foreground">
              {t.finalCta.body}
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="mt-8"
              onClick={() => open(t.finalCta.cta, 'strategy-session', 'details')}
            >
              {t.finalCta.cta}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
