'use client'

import { useLanguage } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
] as const

type Size = 'sm' | 'md'

const SIZE_STYLES: Record<
  Size,
  { container: string; button: string }
> = {
  md: {
    container: 'h-9',
    button: 'min-w-[2.25rem] px-3 text-[11px]',
  },
  sm: {
    container: 'h-7',
    button: 'min-w-[1.75rem] px-2 text-[10px]',
  },
}

export function LanguageToggle({
  scrolled,
  size = 'md',
  className,
}: {
  scrolled: boolean
  size?: Size
  className?: string
}) {
  const { language, setLanguage, t } = useLanguage()
  const activeIndex = LANGS.findIndex((l) => l.code === language)
  const styles = SIZE_STYLES[size]

  return (
    <div
      role="group"
      aria-label={t.nav.languageToggleAria}
      className={cn(
        'relative inline-flex items-center rounded-full border-2 p-[3px] shadow-md ring-1 backdrop-blur-sm transition-colors duration-300',
        styles.container,
        scrolled
          ? 'border-foreground/50 bg-background/70 ring-foreground/15'
          : 'border-white bg-white/70 ring-zinc-900/10',
        className,
      )}
    >
      {/* Sliding pill indicator */}
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute top-[3px] bottom-[3px] left-[3px] w-[calc(50%-3px)] rounded-full shadow-sm transition-[transform,background-color,box-shadow] duration-300 ease-out',
          scrolled ? 'bg-foreground' : 'bg-zinc-900',
        )}
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />
      {LANGS.map((l) => {
        const isActive = l.code === language
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => setLanguage(l.code)}
            aria-pressed={isActive}
            className={cn(
              'relative z-10 inline-flex h-full items-center justify-center rounded-full font-semibold uppercase tracking-[0.18em] transition-colors duration-300',
              styles.button,
              isActive
                ? scrolled
                  ? 'text-background'
                  : 'text-white'
                : scrolled
                  ? 'text-muted-foreground hover:text-foreground'
                  : 'text-zinc-700 hover:text-zinc-900',
            )}
          >
            {l.label}
          </button>
        )
      })}
    </div>
  )
}


