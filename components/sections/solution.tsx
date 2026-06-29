const items = [
  'Conversations',
  'Scheduling',
  'CRM',
  'Inventory',
  'Sales & Invoicing',
  'Purchasing',
  'Live Reporting',
  'AI Co-Pilot',
]

export function Solution() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-24 text-center md:py-32">
        <h2 className="text-balance font-heading text-4xl font-semibold tracking-tight md:text-5xl">
          One interface. One source of truth.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
          Syntra connects every system, conversation, and data point into a
          unified platform designed specifically for how your business operates.
        </p>

        <div className="mx-auto mt-16 max-w-2xl rounded-xl border border-primary/40 bg-card/40">
          <div className="border-b border-border px-5 py-3 text-left">
            <span className="text-xs uppercase tracking-[0.2em] text-primary">
              With Syntra
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
            {items.map((item, i) => (
              <span
                key={item}
                className="syntra-fade-up rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-left text-xs text-foreground"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
