'use client'

import { Button } from '@/components/ui/button'
import { useContact } from '@/components/contact-modal'
import { NetworkBg } from '@/components/network-bg'
import { useLanguage } from '@/lib/i18n'

export function Hero() {
  const { open } = useContact()
  const { t } = useLanguage()

  function scrollTo(href: string) {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="top" className="relative overflow-hidden">
      {/* Background layer: gradient + blue accent + bottom blend */}
      <div className="pointer-events-none absolute inset-0">
        {/* Vertical gradient lifted from the Figma site: light gray -> medium -> near-black */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#efefef_0%,#5a5a5a_30%,#0d0d0d_54%,#0d0d0d_100%)]" />

        {/* Subtle blue radial accent in the upper area */}
        <div className="absolute right-[-10%] top-[-10%] h-[600px] w-[600px] bg-[radial-gradient(closest-side,rgba(74,144,226,0.18),rgba(74,144,226,0.05)_45%,transparent_70%)]" />

        {/* Final blend into the next (dark) section */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
      </div>

      {/*
        Network canvas — full hero, full width. z-50 puts it ABOVE the nav's
        dark backdrop (z-30) but BELOW the nav text (z-60), so the same
        animated graph is visible in both the nav strip and the hero body.
        Two-zone mask, kept SHORT vertically so the IntegrationGraph in the
        bottom half stays completely clean:
          1) Upper-right cluster   = the main graph.
          2) Narrow upper-left strip = landing pad for toroidal wrap lines.
      */}
      <div
        className="pointer-events-none absolute inset-0 z-50"
        style={{
          maskImage:
            'radial-gradient(ellipse 55% 38% at 80% 22%, black 45%, rgba(0,0,0,0.65) 72%, transparent 92%), radial-gradient(ellipse 16% 32% at 0% 22%, black 30%, rgba(0,0,0,0.5) 70%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 55% 38% at 80% 22%, black 45%, rgba(0,0,0,0.65) 72%, transparent 92%), radial-gradient(ellipse 16% 32% at 0% 22%, black 30%, rgba(0,0,0,0.5) 70%, transparent 100%)',
        }}
      >
        <NetworkBg />
      </div>

      <div className="relative z-30 mx-auto max-w-6xl px-6 pb-20 pt-36 md:pt-44">
        <p className="text-xs uppercase tracking-[0.28em] text-primary">
          {t.hero.eyebrow}
        </p>
        <h1 className="mt-6 max-w-3xl text-balance font-heading text-5xl font-semibold leading-[0.92] tracking-[-0.035em] md:text-7xl text-[#f7f7f7]">
          {t.hero.titleLine1}
          <br />
          <span className="text-[rgba(189,189,189,0.38)]">{t.hero.titleLine2}</span>
        </h1>
        <p className="mt-6 max-w-2xl text-balance font-heading text-lg font-medium leading-snug text-[#e6e6e6] md:text-xl">
          {t.hero.subtitle}
        </p>
        <p className="mt-8 max-w-xl text-pretty leading-relaxed text-muted-foreground">
          {t.hero.body}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            variant="secondary"
            onClick={() => open(t.hero.ctaPrimary)}
          >
            {t.hero.ctaPrimary}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => scrollTo('#getting-started')}
          >
            {t.hero.ctaSecondary}
          </Button>
        </div>
      </div>
    </section>
  )
}


