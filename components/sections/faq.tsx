'use client'

import { Plus } from 'lucide-react'
import { useLanguage } from '@/lib/i18n'

export function Faq() {
  const { t } = useLanguage()

  return (
    <section id="faq" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
          {t.faq.eyebrow}
        </p>
        <h2 className="mt-5 max-w-2xl text-balance font-heading text-4xl font-semibold tracking-tight md:text-5xl">
          {t.faq.title}
        </h2>
        <p className="mt-6 max-w-2xl leading-relaxed text-muted-foreground">
          {t.faq.body}
        </p>

        <div className="mt-12 divide-y divide-border rounded-xl border border-border bg-card/40">
          {t.faq.items.map((item) => (
            <details key={item.q} className="group px-6 py-5 md:px-8">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-base font-medium text-foreground/90 marker:content-none md:text-lg">
                {item.q}
                <Plus className="size-5 shrink-0 text-primary transition-transform duration-200 group-open:rotate-45" />
              </summary>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
