'use client'

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { Check, ArrowLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
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
import { useLanguage } from '@/lib/i18n'
import type { PricingTier, ContactFormData } from '@/lib/email'

const CONTACT_EMAIL = siteConfig.contactEmail

type ContactContextValue = {
  open: (intent?: string, tier?: PricingTier) => void
}

const ContactContext = createContext<ContactContextValue | null>(null)

export function useContact() {
  const ctx = useContext(ContactContext)
  if (!ctx) throw new Error('useContact must be used within ContactProvider')
  return ctx
}

// Tool options for the checkbox
const TOOL_OPTIONS = [
  { id: 'excel', labelKey: 'excel' as const },
  { id: 'crm', labelKey: 'crm' as const },
  { id: 'scheduling', labelKey: 'scheduling' as const },
  { id: 'inventory', labelKey: 'inventory' as const },
  { id: 'accounting', labelKey: 'accounting' as const },
  { id: 'whatsapp', labelKey: 'whatsapp' as const },
  { id: 'none', labelKey: 'none' as const },
]

export function ContactProvider({ children }: { children: ReactNode }) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [intent, setIntent] = useState<string | undefined>()
  const [tier, setTier] = useState<PricingTier>('strategy-session')
  const [step, setStep] = useState<1 | 2 | 'success' | 'error'>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Form state
  const [formData, setFormData] = useState<Partial<ContactFormData>>({
    currentTools: [],
  })

  const open = useCallback((nextIntent?: string, nextTier?: PricingTier) => {
    setIntent(nextIntent)
    setTier(nextTier ?? 'strategy-session')
    setStep(1)
    setIsSubmitting(false)
    setErrorMessage('')
    setFormData({ currentTools: [] })
    setIsOpen(true)
  }, [])

  function updateFormData<K extends keyof ContactFormData>(
    field: K,
    value: ContactFormData[K]
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function toggleTool(toolId: string) {
    setFormData((prev) => {
      const current = prev.currentTools || []
      const updated = current.includes(toolId)
        ? current.filter((t) => t !== toolId)
        : [...current, toolId]
      return { ...prev, currentTools: updated }
    })
  }

  function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  function canProceedToStep2(): boolean {
    return !!(
      formData.name?.trim() &&
      formData.email?.trim() &&
      isValidEmail(formData.email) &&
      formData.company?.trim() &&
      formData.message?.trim()
    )
  }

  function canSubmit(): boolean {
    // Common fields for all tiers
    if (!formData.industry?.trim() || !formData.teamSize) {
      return false
    }

    // Tier-specific validation
    switch (tier) {
      case 'strategy-session':
        return !!formData.mainChallenge?.trim()
      case 'system-build':
        return !!(
          formData.currentTools &&
          formData.currentTools.length > 0 &&
          formData.timeline &&
          formData.budgetRange
        )
      case 'ongoing-partnership':
        return !!(formData.expectedGrowth && formData.partnershipGoals?.trim())
      default:
        return true
    }
  }

  function getEmailError(): string | null {
    if (!formData.email) return null
    if (!isValidEmail(formData.email)) return t.contact.invalidEmail
    return null
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    setErrorMessage('')

    const payload: ContactFormData = {
      name: formData.name || '',
      email: formData.email || '',
      company: formData.company || '',
      message: formData.message || '',
      tier,
      tierTitle: intent || t.contact.fallbackTitle,
      industry: formData.industry,
      teamSize: formData.teamSize,
      mainChallenge: formData.mainChallenge,
      currentTools: formData.currentTools,
      timeline: formData.timeline,
      budgetRange: formData.budgetRange,
      expectedGrowth: formData.expectedGrowth,
      partnershipGoals: formData.partnershipGoals,
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send message')
      }

      setStep('success')
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Something went wrong'
      )
      setStep('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  function renderStep1() {
    return (
      <>
        <DialogHeader>
          <DialogTitle>{intent ?? t.contact.fallbackTitle}</DialogTitle>
          <DialogDescription>{t.contact.description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              1
            </span>
            <span>{t.contact.step1Title}</span>
            <div className="h-px flex-1 bg-border" />
            <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
              2
            </span>
            <span className="text-muted-foreground/60">{t.contact.step2Title}</span>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">{t.contact.nameLabel}</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder={t.contact.namePlaceholder}
              value={formData.name || ''}
              onChange={(e) => updateFormData('name', e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{t.contact.emailLabel}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder={t.contact.emailPlaceholder}
              value={formData.email || ''}
              onChange={(e) => updateFormData('email', e.target.value)}
              className={getEmailError() ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {getEmailError() && (
              <p className="text-xs text-destructive">{getEmailError()}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="company">{t.contact.companyLabel}</Label>
            <Input
              id="company"
              name="company"
              placeholder={t.contact.companyPlaceholder}
              value={formData.company || ''}
              onChange={(e) => updateFormData('company', e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="message">{t.contact.messageLabel}</Label>
            <Textarea
              id="message"
              name="message"
              rows={3}
              placeholder={t.contact.messagePlaceholder}
              value={formData.message || ''}
              onChange={(e) => updateFormData('message', e.target.value)}
            />
          </div>

          <Button
            type="button"
            className="w-full"
            disabled={!canProceedToStep2()}
            onClick={() => setStep(2)}
          >
            {t.contact.next}
            <ArrowRight className="ml-2 size-4" />
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            {t.contact.preferEmail}{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
      </>
    )
  }

  function renderStep2() {
    return (
      <>
        <DialogHeader>
          <DialogTitle>{t.contact.step2Header}</DialogTitle>
          <DialogDescription>{t.contact.step2Description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex size-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-medium text-primary">
              <Check className="size-3" />
            </span>
            <span className="text-muted-foreground/60">{t.contact.step1Title}</span>
            <div className="h-px flex-1 bg-border" />
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              2
            </span>
            <span>{t.contact.step2Title}</span>
          </div>

          {/* Common fields for all tiers */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="industry">{t.contact.industryLabel}</Label>
            <Input
              id="industry"
              placeholder={t.contact.industryPlaceholder}
              value={formData.industry || ''}
              onChange={(e) => updateFormData('industry', e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="teamSize">{t.contact.teamSizeLabel}</Label>
            <select
              id="teamSize"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={formData.teamSize || ''}
              onChange={(e) => updateFormData('teamSize', e.target.value)}
            >
              <option value="">{t.contact.selectOption}</option>
              {t.contact.teamSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Tier-specific fields */}
          {tier === 'strategy-session' && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="mainChallenge">{t.contact.mainChallengeLabel}</Label>
              <Textarea
                id="mainChallenge"
                rows={2}
                placeholder={t.contact.mainChallengePlaceholder}
                value={formData.mainChallenge || ''}
                onChange={(e) => updateFormData('mainChallenge', e.target.value)}
              />
            </div>
          )}

          {tier === 'system-build' && (
            <>
              <div className="flex flex-col gap-2">
                <Label>{t.contact.currentToolsLabel}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {TOOL_OPTIONS.map((tool) => (
                    <label
                      key={tool.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                        formData.currentTools?.includes(tool.id)
                          ? 'border-primary bg-primary/5 text-foreground'
                          : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={formData.currentTools?.includes(tool.id) || false}
                        onChange={() => toggleTool(tool.id)}
                      />
                      <div
                        className={`flex size-4 items-center justify-center rounded border ${
                          formData.currentTools?.includes(tool.id)
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground/40'
                        }`}
                      >
                        {formData.currentTools?.includes(tool.id) && (
                          <Check className="size-3 text-primary-foreground" />
                        )}
                      </div>
                      {t.contact.toolOptions[tool.labelKey]}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="timeline">{t.contact.timelineLabel}</Label>
                <select
                  id="timeline"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.timeline || ''}
                  onChange={(e) => updateFormData('timeline', e.target.value)}
                >
                  <option value="">{t.contact.selectOption}</option>
                  {t.contact.timelineOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="budgetRange">{t.contact.budgetLabel}</Label>
                <select
                  id="budgetRange"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.budgetRange || ''}
                  onChange={(e) => updateFormData('budgetRange', e.target.value)}
                >
                  <option value="">{t.contact.selectOption}</option>
                  {t.contact.budgetOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {tier === 'ongoing-partnership' && (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="expectedGrowth">{t.contact.expectedGrowthLabel}</Label>
                <select
                  id="expectedGrowth"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.expectedGrowth || ''}
                  onChange={(e) => updateFormData('expectedGrowth', e.target.value)}
                >
                  <option value="">{t.contact.selectOption}</option>
                  {t.contact.growthOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="partnershipGoals">{t.contact.partnershipGoalsLabel}</Label>
                <Textarea
                  id="partnershipGoals"
                  rows={2}
                  placeholder={t.contact.partnershipGoalsPlaceholder}
                  value={formData.partnershipGoals || ''}
                  onChange={(e) => updateFormData('partnershipGoals', e.target.value)}
                />
              </div>
            </>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setStep(1)}
            >
              <ArrowLeft className="mr-2 size-4" />
              {t.contact.back}
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={isSubmitting || !canSubmit()}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {t.contact.sending}
                </>
              ) : (
                t.contact.submit
              )}
            </Button>
          </div>
        </div>
      </>
    )
  }

  function renderSuccess() {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Check className="size-6" />
        </span>
        <DialogHeader className="items-center">
          <DialogTitle className="text-center">{t.contact.receivedTitle}</DialogTitle>
          <DialogDescription className="text-center">
            {t.contact.receivedBody}
          </DialogDescription>
        </DialogHeader>
        <Button variant="secondary" onClick={() => setIsOpen(false)} className="mt-2">
          {t.contact.close}
        </Button>
      </div>
    )
  }

  function renderError() {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
          <AlertCircle className="size-6" />
        </span>
        <DialogHeader className="items-center">
          <DialogTitle className="text-center">{t.contact.errorTitle}</DialogTitle>
          <DialogDescription className="text-center">
            {errorMessage || t.contact.errorBody}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep(2)}>
            {t.contact.tryAgain}
          </Button>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            {t.contact.close}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {t.contact.preferEmail}{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-primary underline-offset-4 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
      </div>
    )
  }

  return (
    <ContactContext.Provider value={{ open }}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md border border-primary/30">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 'success' && renderSuccess()}
          {step === 'error' && renderError()}
        </DialogContent>
      </Dialog>
    </ContactContext.Provider>
  )
}
