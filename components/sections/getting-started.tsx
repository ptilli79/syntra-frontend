'use client'

import { useLanguage } from '@/lib/i18n'

export function GettingStarted() {
  const { t } = useLanguage()
  const steps = t.gettingStarted.steps.map((s, idx) => ({
    n: String(idx + 1).padStart(2, '0'),
    ...s,
  }))

  return (
    <section id="getting-started" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
          {t.gettingStarted.eyebrow}
        </p>
        <h2 className="mt-5 font-heading text-4xl font-semibold tracking-tight md:text-5xl">
          {t.gettingStarted.title}
        </h2>
        <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
          {t.gettingStarted.body}
        </p>

        <ol className="mt-16 grid gap-10 md:grid-cols-5 md:gap-6">
          {steps.map((step) => (
            <li key={step.n} className="relative">
              <div className="flex size-11 items-center justify-center rounded-full border border-primary/40 bg-primary/10 font-heading text-sm text-primary">
                {step.n}
              </div>
              <h3 className="mt-5 font-heading text-lg font-medium">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {step.desc}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
