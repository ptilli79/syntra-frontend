'use client'

import Link from 'next/link'
import { Logo } from '@/components/logo'
import { useContact } from '@/components/contact-modal'

export function Footer() {
  const { open } = useContact()

  return (
    <footer className="border-t border-border">
      {/* Trust strip — quiet reliability signals, not pitched as "features". */}
      <div className="border-b border-border/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 py-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span>Encrypted daily backups</span>
          <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/40 md:inline-block" />
          <span>Role-based access</span>
          <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/40 md:inline-block" />
          <span>HTTPS · JWT auth</span>
          <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/40 md:inline-block" />
          <span>99.9% target uptime</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-10 md:flex-row md:justify-between">
        <Logo />
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Syntra Systems. Custom Business Operating
          Systems.
        </p>
        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/privacy"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Privacy
          </Link>
          <button
            type="button"
            onClick={() => open('Contact Syntra')}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Contact
          </button>
        </div>
      </div>
    </footer>
  )
}
