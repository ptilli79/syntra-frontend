'use client'

import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { useContact } from '@/components/contact-modal'
import { LanguageToggle } from '@/components/language-toggle'
import { useLanguage } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function SiteNav() {
  const { open } = useContact()
  const { t } = useLanguage()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { label: t.nav.services, href: '#services' },
    { label: t.nav.gettingStarted, href: '#getting-started' },
    { label: t.nav.about, href: '#about' },
    { label: t.nav.pricing, href: '#pricing' },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleNav(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault()
    setMenuOpen(false)
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/*
        Dark backdrop strip (z-40). Sits ABOVE the hero text (z-30) so
        scrolled text doesn't bleed under the nav, and BELOW the network
        canvas (z-50) so the same graph stays visible in this strip.
      */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none fixed inset-x-0 top-0 z-40 h-20 border-b backdrop-blur-md transition-opacity duration-300',
          scrolled
            ? 'border-border bg-background/80 opacity-100'
            : 'border-transparent bg-background/0 opacity-0',
        )}
      />

      <header
        className={cn(
          'fixed inset-x-0 top-0 z-[60] transition-colors duration-300',
          scrolled ? 'text-foreground' : 'text-zinc-900',
        )}
      >
        <nav className="relative mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <a
            href="#top"
            onClick={(e) => handleNav(e, '#top')}
            aria-label="Syntra Systems home"
            className="flex items-center"
          >
            {/* Mobile: compact, left-aligned so the wordmark sits at the
                container edge and lines up with the hero text below. */}
            <span className="md:hidden">
              <Logo
                scrolled={scrolled}
                width={220}
                height={72}
                zoom={3.0}
                align="left"
              />
            </span>
            {/* Desktop: original size, centered content. */}
            <span className="hidden md:inline-block">
              <Logo scrolled={scrolled} />
            </span>
          </a>

          <div className="hidden items-center gap-11 md:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNav(e, link.href)}
                className={cn(
                  'text-base font-medium transition-colors',
                  scrolled
                    ? 'text-muted-foreground hover:text-foreground'
                    : 'text-zinc-800/80 hover:text-zinc-900',
                )}
              >
                {link.label}
              </a>
            ))}
            <Button
              onClick={() => open(t.nav.scheduleCall)}
              className={cn(
                'h-9 rounded-lg border px-5 text-sm font-medium transition-colors duration-300 ease-out',
                scrolled
                  ? 'border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100'
                  : 'border-zinc-800 bg-zinc-900 text-white hover:bg-zinc-800',
              )}
            >
              {t.nav.scheduleCall}
            </Button>
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <button
              type="button"
              className={cn(scrolled ? 'text-foreground' : 'text-zinc-900')}
              aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </nav>

        {/* Desktop language toggle anchored to the viewport's right edge,
            outside the centered nav container. On mobile the toggle lives
            inside the burger dropdown (see below) to keep the top bar clean. */}
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden items-center pr-6 md:flex">
          <div className="pointer-events-auto">
            <LanguageToggle scrolled={scrolled} />
          </div>
        </div>

        {menuOpen && (
          <div className="relative border-t border-border bg-background/95 backdrop-blur-md md:hidden">
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4">
              {links.map((link, i) => (
                <div
                  key={link.href}
                  className="flex items-center justify-between gap-3"
                >
                  <a
                    href={link.href}
                    onClick={(e) => handleNav(e, link.href)}
                    className="flex-1 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    {link.label}
                  </a>
                  {i === 0 && <LanguageToggle scrolled size="sm" />}
                </div>
              ))}
              <Button
                className="mt-2 w-full"
                onClick={() => {
                  setMenuOpen(false)
                  open(t.nav.scheduleCall)
                }}
              >
                {t.nav.scheduleCall}
              </Button>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
