'use client'

import { IntegrationGraph } from '@/components/sections/integration-graph'
import { useLanguage } from '@/lib/i18n'

export function Problem() {
  const { t } = useLanguage()
  return (
    <section className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-2 md:items-center md:py-32">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
            {t.problem.eyebrow}
          </p>
          <h2 className="mt-5 text-balance font-heading text-4xl font-semibold tracking-tight md:text-5xl">
            {t.problem.title}
          </h2>
          <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
            {t.problem.body}
          </p>
          <ul className="mt-8 flex flex-col gap-4">
            {t.problem.items.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm">
                <span className="size-1.5 rounded-full bg-primary" />
                <span className="text-foreground/90">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative rounded-xl border border-border bg-card/40 p-2">
          <IntegrationGraph />
        </div>
      </div>
    </section>
  )
}
