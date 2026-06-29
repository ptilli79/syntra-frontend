const steps = [
  {
    n: '01',
    title: 'Discovery',
    desc: 'We map every tool, workflow, gap, and friction point in your current operations.',
  },
  {
    n: '02',
    title: 'System Design',
    desc: 'We architect your operating system before a single line of code is written.',
  },
  {
    n: '03',
    title: 'Integration',
    desc: 'We connect existing tools and build custom infrastructure where gaps exist.',
  },
  {
    n: '04',
    title: 'Deployment',
    desc: 'We go live with your team — training, documentation, and a smooth handoff included.',
  },
  {
    n: '05',
    title: 'Support & Optimization',
    desc: 'Ongoing support, continuous improvement, and system expansion as your business grows.',
  },
]

export function GettingStarted() {
  return (
    <section id="getting-started" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
          How It Works
        </p>
        <h2 className="mt-5 font-heading text-4xl font-semibold tracking-tight md:text-5xl">
          Getting Started
        </h2>
        <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
          From first conversation to live system, here&apos;s exactly what
          working with Syntra looks like.
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
