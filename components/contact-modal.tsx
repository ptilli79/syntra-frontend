'use client'

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { siteConfig } from '@/lib/site'

const CONTACT_EMAIL = siteConfig.contactEmail

type ContactContextValue = {
  open: (intent?: string) => void
}

const ContactContext = createContext<ContactContextValue | null>(null)

export function useContact() {
  const ctx = useContext(ContactContext)
  if (!ctx) throw new Error('useContact must be used within ContactProvider')
  return ctx
}

export function ContactProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [intent, setIntent] = useState<string | undefined>()
  const [submitted, setSubmitted] = useState(false)

  const open = useCallback((nextIntent?: string) => {
    setIntent(nextIntent)
    setSubmitted(false)
    setIsOpen(true)
  }, [])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Placeholder submit — wire to email/DB/CRM later.
    setSubmitted(true)
  }

  return (
    <ContactContext.Provider value={{ open }}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Check className="size-6" />
              </span>
              <DialogHeader className="items-center">
                <DialogTitle className="text-center">Request received</DialogTitle>
                <DialogDescription className="text-center">
                  Thanks for reaching out. We&apos;ll get back to you within one
                  business day to schedule your session.
                </DialogDescription>
              </DialogHeader>
              <Button
                variant="secondary"
                onClick={() => setIsOpen(false)}
                className="mt-2"
              >
                Close
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{intent ?? 'Schedule a Call'}</DialogTitle>
                <DialogDescription>
                  Tell us a bit about your business and we&apos;ll be in touch to
                  set up a time.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required placeholder="Jane Operator" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Work email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="jane@company.com"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" name="company" placeholder="Company name" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="message">What are you trying to fix?</Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={3}
                    placeholder="Tell us about the systems and workflows you want to connect."
                  />
                </div>
                <Button type="submit" className="w-full">
                  Send request
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Prefer email? Reach us at{' '}
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </p>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </ContactContext.Provider>
  )
}
