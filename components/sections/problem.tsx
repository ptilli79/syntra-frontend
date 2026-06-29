import { IntegrationGraph } from '@/components/sections/integration-graph'

export function Problem() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-2 md:items-center md:py-32">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
            The Problem
          </p>
          <h2 className="mt-5 text-balance font-heading text-4xl font-semibold tracking-tight md:text-5xl">
            Your business is running in fragments.
          </h2>
          <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
            Your tools don&apos;t talk. Your data lives in silos. Your team
            becomes the integration layer — spending hours on reconciliation
            that should be automatic.
          </p>
          <ul className="mt-8 flex flex-col gap-4">
            {[
              'Context lost between every handoff',
              "Manual work that shouldn't exist",
              'Decisions made on incomplete data',
            ].map((item) => (
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
