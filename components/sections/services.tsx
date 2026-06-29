'use client'

import { useLanguage } from '@/lib/i18n'

export function Services() {
  const { t } = useLanguage()
  const services = t.services.items.map((item, idx) => ({
    n: String(idx + 1).padStart(2, '0'),
    ...item,
  }))

  return (
    <section id="services" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
          {t.services.eyebrow}
        </p>
        <h2 className="mt-5 max-w-xl text-balance font-heading text-4xl font-semibold tracking-tight md:text-5xl">
          {t.services.title}
        </h2>

        <div className="mt-14 grid overflow-hidden rounded-xl border border-border sm:grid-cols-2">
          {services.map((s, i) => (
            <div
              key={s.n}
              className={`group p-8 transition-colors hover:bg-secondary/40 md:p-10 ${
                i % 2 === 0 ? 'sm:border-r border-border' : ''
              } ${i < 2 ? 'border-b border-border' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-heading text-sm text-primary">{s.n}</span>
                <span className="font-heading text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {s.tag}
                </span>
              </div>
              <h3 className="mt-6 font-heading text-2xl font-medium">
                {s.title}
              </h3>
              <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
