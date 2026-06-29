import Image from 'next/image'
import { MapPin } from 'lucide-react'

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  )
}

const founders = [
  {
    name: 'Ana Algernon Luján',
    role: 'Co-Founder & Strategy Lead',
    location: 'United States',
    image: '/founders/ana.png',
    bio: 'Ana brings deep expertise in business operations and systems thinking to Syntra. With a background spanning operations strategy, client consulting, and process design, she translates business complexity into architectures that actually work. Bilingual and cross-cultural by nature, she ensures every system we build reflects the real texture of how teams and customers communicate.',
    tags: ['Operations Strategy', 'Client Consulting', 'Process Design', 'Bilingual'],
  },
  {
    name: 'Pierpaolo Tilli',
    role: 'Co-Founder & Systems Architect',
    location: 'Jersey City, NJ',
    image: '/founders/pierpaolo.png',
    bio: 'Pierpaolo brings two decades of telecommunications and systems architecture to Syntra. A PMP-certified engineer with experience across Venezuela, Mexico, and the United States, he has spent his career designing complex infrastructure for global carriers — and now applies that same precision to business operating systems. Fluent in AI agent architecture, AWS, and automation frameworks, he ensures every system we build is engineered to last.',
    tags: ['Systems Architecture', 'AI & Automation', 'Telecom Infrastructure', 'PMP Certified'],
  },
]

export function About() {
  return (
    <section id="about" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
          About Us
        </p>
        <h2 className="mt-5 text-balance font-heading text-4xl font-semibold tracking-tight md:text-5xl">
          Built by operators, for operators.
        </h2>
        <p className="mt-6 max-w-xl leading-relaxed text-muted-foreground">
          Syntra was founded by two people who spent careers watching businesses
          fail at the seams between their tools. We decided to fix it by design,
          not by accident.
        </p>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {founders.map((f) => (
            <article
              key={f.name}
              className="flex flex-col rounded-xl border border-border bg-card/40 p-6 md:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Image
                    src={f.image || '/placeholder.svg'}
                    alt={`Portrait of ${f.name}`}
                    width={72}
                    height={72}
                    className="size-16 rounded-full object-cover md:size-[72px]"
                  />
                  <div>
                    <h3 className="font-heading text-lg font-semibold">
                      {f.name}
                    </h3>
                    <p className="text-sm text-primary">{f.role}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" /> {f.location}
                    </p>
                  </div>
                </div>
                <a
                  href="#"
                  aria-label={`${f.name} on LinkedIn`}
                  className="flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                >
                  <LinkedinIcon className="size-4" />
                </a>
              </div>

              <p className="mt-6 flex-1 text-sm leading-relaxed text-muted-foreground">
                {f.bio}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {f.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-12 max-w-2xl text-center text-pretty leading-relaxed text-muted-foreground">
          Together, Ana and Pierpaolo bring a rare combination of business
          strategy and technical depth — the two things every operating system
          requires.
        </p>
      </div>
    </section>
  )
}
