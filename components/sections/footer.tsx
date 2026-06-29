'use client'

import Link from 'next/link'
import { Logo } from '@/components/logo'
import { useContact } from '@/components/contact-modal'
import { useLanguage } from '@/lib/i18n'

export function Footer() {
  const { open } = useContact()
  const { t } = useLanguage()

  return (
    <footer className="border-t border-border">
      {/* Trust strip — quiet reliability signals, not pitched as "features". */}
      <div className="border-b border-border/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 py-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {t.footer.trust.map((item, i) => (
            <span key={item} className="flex items-center gap-x-8">
              <span>{item}</span>
              {i < t.footer.trust.length - 1 && (
                <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/40 md:inline-block" />
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-10 md:flex-row md:justify-between">
        <Logo />
        <p className="text-center text-sm text-muted-foreground">
          {t.footer.copyright(new Date().getFullYear())}
        </p>
        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/privacy"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t.footer.privacy}
          </Link>
          <button
            type="button"
            onClick={() => open(t.footer.contactIntent)}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t.footer.contact}
          </button>
        </div>
      </div>
    </footer>
  )
}
