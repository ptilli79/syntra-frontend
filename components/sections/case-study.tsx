'use client'

import { Check, X } from 'lucide-react'
import { useLanguage } from '@/lib/i18n'

export function CaseStudy() {
  const { t } = useLanguage()
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
          {t.caseStudy.eyebrow}
        </p>
        <h2 className="mt-5 max-w-2xl text-balance font-heading text-4xl font-semibold tracking-tight md:text-5xl">
          {t.caseStudy.titleA}
          <span className="text-muted-foreground/70">{t.caseStudy.titleB}</span>
        </h2>
        <p className="mt-6 max-w-2xl leading-relaxed text-muted-foreground">
          {t.caseStudy.body}
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <ComparisonCard
            label={t.caseStudy.beforeLabel}
            items={t.caseStudy.before}
            positive={false}
          />
          <ComparisonCard
            label={t.caseStudy.afterLabel}
            items={t.caseStudy.after}
            positive
          />
        </div>

        <blockquote className="mt-12 rounded-xl border border-border bg-card/40 p-8 md:p-10">
          <p className="text-balance font-heading text-xl font-medium leading-snug md:text-2xl">
            {t.caseStudy.quote}
          </p>
          <footer className="mt-4 text-sm text-muted-foreground">
            {t.caseStudy.quoteFooter}
          </footer>
        </blockquote>
      </div>
    </section>
  )
}

function ComparisonCard({
  label,
  items,
  positive,
}: {
  label: string
  items: string[]
  positive: boolean
}) {
  return (
    <div
      className={`rounded-xl border bg-card/40 p-8 ${
        positive ? 'border-primary/40' : 'border-border'
      }`}
    >
      <span
        className={`text-xs uppercase tracking-[0.2em] ${
          positive ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        {label}
      </span>
      <ul className="mt-6 flex flex-col gap-4">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm">
            <span
              className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${
                positive
                  ? 'bg-primary/15 text-primary'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {positive ? (
                <Check className="size-3" />
              ) : (
                <X className="size-3" />
              )}
            </span>
            <span className="text-foreground/90">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
