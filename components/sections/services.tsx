const services = [
  {
    n: '01',
    tag: 'Omnichannel',
    title: 'Customer Communication Systems',
    desc: 'Handle conversations across every channel customers already use — unified, contextual, and tracked.',
  },
  {
    n: '02',
    tag: 'Automation',
    title: 'Workflow Automation',
    desc: 'Remove repetitive manual work. Every action that can be automated, is — reliably and invisibly.',
  },
  {
    n: '03',
    tag: 'Infrastructure',
    title: 'Business Operations Platforms',
    desc: 'Connect the systems that run your business. Scheduling, inventory, CRM, and reporting in one place.',
  },
  {
    n: '04',
    tag: 'Intelligence',
    title: 'AI Assistants',
    desc: 'Ask your business questions in natural language using real company data. Intelligence without configuration.',
  },
]

export function Services() {
  return (
    <section id="services" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
          Services
        </p>
        <h2 className="mt-5 max-w-xl text-balance font-heading text-4xl font-semibold tracking-tight md:text-5xl">
          What we design for you.
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
