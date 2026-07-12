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

// Tool options for the checkbox (Core + Bespoke)
const TOOL_OPTIONS = [
  { id: 'excel', labelKey: 'excel' as const },
  { id: 'inhouse', labelKey: 'inhouse' as const },
  { id: 'commercial', labelKey: 'commercial' as const },
  { id: 'whatsapp', labelKey: 'whatsapp' as const },
  { id: 'manual', labelKey: 'manual' as const },
  { id: 'other', labelKey: 'other' as const },
  { id: 'none', labelKey: 'none' as const },
]

// Operations to organize (Core)
const OPERATION_OPTIONS = [
  { id: 'inventory', labelKey: 'inventory' as const },
  { id: 'sales', labelKey: 'sales' as const },
  { id: 'purchasing', labelKey: 'purchasing' as const },
  { id: 'customers', labelKey: 'customers' as const },
  { id: 'quotations', labelKey: 'quotations' as const },
]

// Priority capabilities (Pro)
const CAPABILITY_OPTIONS = [
  { id: 'aiAssistant', labelKey: 'aiAssistant' as const },
  { id: 'whatsappAgent', labelKey: 'whatsappAgent' as const },
  { id: 'analytics', labelKey: 'analytics' as const },
  { id: 'rotation', labelKey: 'rotation' as const },
  { id: 'autoQuotations', labelKey: 'autoQuotations' as const },
]

function CheckboxGrid({
  options,
  selected,
  onToggle,
}: {
  options: { id: string; label: string }[]
  selected: string[]
  onToggle: (id: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt.id)
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onToggle(opt.id)}
            aria-pressed={active}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
              active
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export function ContactProvider({ children }: { children: ReactNode }) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [intent, setIntent] = useState<string | undefined>()
  const [tier, setTier] = useState<PricingTier>('strategy-session')
  const [step, setStep] = useState<1 | 2 | 3 | 'error'>(1)
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
      let updated: string[]
      if (toolId === 'none') {
        // Selecting "None" clears every other tool (and toggles off if already only none)
        updated = current.includes('none') ? [] : ['none']
      } else {
        // Selecting any real tool removes "None"
        const withoutNone = current.filter((t) => t !== 'none')
        updated = withoutNone.includes(toolId)
          ? withoutNone.filter((t) => t !== toolId)
          : [...withoutNone, toolId]
      }
      return { ...prev, currentTools: updated }
    })
  }

  function toggleMulti(field: 'coreOperations' | 'proCapabilities', id: string) {
    setFormData((prev) => {
      const current = (prev[field] as string[] | undefined) || []
      const updated = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id]
      return { ...prev, [field]: updated }
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
      case 'core':
        return !!(
          formData.coreOperations?.length &&
          formData.currentTools?.length &&
          formData.timeline
        )
      case 'pro':
        return !!(formData.proCapabilities?.length && formData.monthlyVolume)
      case 'bespoke':
        return !!(
          formData.currentTools?.length &&
          formData.deployment &&
          formData.budgetRange
        )
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
      coreOperations: formData.coreOperations,
      proCapabilities: formData.proCapabilities,
      monthlyVolume: formData.monthlyVolume,
      deployment: formData.deployment,
      currentTools: formData.currentTools,
      currentToolsOther: formData.currentToolsOther,
      timeline: formData.timeline,
      budgetRange: formData.budgetRange,
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

      setStep(3)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Something went wrong'
      )
      setStep('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper to check if a field is filled
  function isFieldFilled(value: string | string[] | undefined): boolean {
    if (Array.isArray(value)) return value.length > 0
    return !!(value && value.trim())
  }

  // Fields still required to continue past step 1
  function getStep1Missing(): string[] {
    const missing: string[] = []
    if (!isFieldFilled(formData.name)) missing.push(t.contact.nameLabel)
    if (!formData.email?.trim() || !isValidEmail(formData.email)) missing.push(t.contact.emailLabel)
    if (!isFieldFilled(formData.company)) missing.push(t.contact.companyLabel)
    if (!isFieldFilled(formData.message)) missing.push(t.contact.messageLabel)
    return missing
  }

  // Fields still required to submit step 2 (varies by tier)
  function getStep2Missing(): string[] {
    const missing: string[] = []
    if (!isFieldFilled(formData.industry)) missing.push(t.contact.industryLabel)
    if (!isFieldFilled(formData.teamSize)) missing.push(t.contact.teamSizeLabel)
    switch (tier) {
      case 'strategy-session':
        if (!isFieldFilled(formData.mainChallenge)) missing.push(t.contact.mainChallengeLabel)
        break
      case 'core':
        if (!formData.coreOperations?.length) missing.push(t.contact.coreOperationsLabel)
        if (!formData.currentTools?.length) missing.push(t.contact.currentToolsLabel)
        if (!isFieldFilled(formData.timeline)) missing.push(t.contact.timelineLabel)
        break
      case 'pro':
        if (!formData.proCapabilities?.length) missing.push(t.contact.capabilitiesLabel)
        if (!isFieldFilled(formData.monthlyVolume)) missing.push(t.contact.monthlyVolumeLabel)
        break
      case 'bespoke':
        if (!formData.currentTools?.length) missing.push(t.contact.currentToolsLabel)
        if (!isFieldFilled(formData.deployment)) missing.push(t.contact.deploymentLabel)
        if (!isFieldFilled(formData.budgetRange)) missing.push(t.contact.budgetLabel)
        break
    }
    return missing
  }

  // Helper component for field labels with completion indicator
  function FieldLabel({ htmlFor, children, filled }: { htmlFor: string; children: React.ReactNode; filled: boolean }) {
    return (
      <Label htmlFor={htmlFor} className="flex items-center gap-2">
        {children}
        {filled && (
          <Check className="size-3.5 text-primary" />
        )}
      </Label>
    )
  }

  // Helper for input styling based on completion
  function getInputClass(value: string | undefined, hasError?: boolean): string {
    if (hasError) return 'border-destructive focus-visible:ring-destructive'
    if (isFieldFilled(value)) return 'border-primary/40 focus-visible:ring-primary/40'
    return ''
  }

  // Helper for select styling based on completion
  function getSelectClass(value: string | undefined): string {
    const base = 'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
    if (isFieldFilled(value)) return `${base} border-primary/40 text-foreground`
    return `${base} border-input text-muted-foreground`
  }

  function renderStep1() {
    return (
      <>
        <DialogHeader>
          <DialogTitle>{intent ?? t.contact.fallbackTitle}</DialogTitle>
          <DialogDescription>{t.contact.stepOf(1, 2, t.contact.step1Title)}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="name" filled={isFieldFilled(formData.name)}>{t.contact.nameLabel}</FieldLabel>
            <Input
              id="name"
              name="name"
              required
              placeholder={t.contact.namePlaceholder}
              value={formData.name || ''}
              onChange={(e) => updateFormData('name', e.target.value)}
              className={getInputClass(formData.name)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="email" filled={isFieldFilled(formData.email) && isValidEmail(formData.email || '')}>{t.contact.emailLabel}</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder={t.contact.emailPlaceholder}
              value={formData.email || ''}
              onChange={(e) => updateFormData('email', e.target.value)}
              className={getEmailError() ? 'border-destructive focus-visible:ring-destructive' : getInputClass(formData.email)}
            />
            {getEmailError() && (
              <p className="text-xs text-destructive">{getEmailError()}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="company" filled={isFieldFilled(formData.company)}>{t.contact.companyLabel}</FieldLabel>
            <Input
              id="company"
              name="company"
              placeholder={t.contact.companyPlaceholder}
              value={formData.company || ''}
              onChange={(e) => updateFormData('company', e.target.value)}
              className={getInputClass(formData.company)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="message" filled={isFieldFilled(formData.message)}>{t.contact.messageLabel}</FieldLabel>
            <Textarea
              id="message"
              name="message"
              rows={3}
              placeholder={t.contact.messagePlaceholder}
              value={formData.message || ''}
              onChange={(e) => updateFormData('message', e.target.value)}
              className={getInputClass(formData.message)}
            />
          </div>

          {getStep1Missing().length > 0 && (
            <p className="text-xs text-muted-foreground">
              {t.contact.stillNeeded}{' '}
              <span className="text-foreground/80">{getStep1Missing().join(' · ')}</span>
            </p>
          )}

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
          <DialogTitle>{intent ?? t.contact.fallbackTitle}</DialogTitle>
          <DialogDescription>{t.contact.stepOf(2, 2, t.contact.step2Title)}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Common fields for all tiers */}
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="industry" filled={isFieldFilled(formData.industry)}>{t.contact.industryLabel}</FieldLabel>
            <Input
              id="industry"
              placeholder={t.contact.industryPlaceholder}
              value={formData.industry || ''}
              onChange={(e) => updateFormData('industry', e.target.value)}
              className={getInputClass(formData.industry)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="teamSize" filled={isFieldFilled(formData.teamSize)}>{t.contact.teamSizeLabel}</FieldLabel>
            <select
              id="teamSize"
              className={getSelectClass(formData.teamSize)}
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
              <FieldLabel htmlFor="mainChallenge" filled={isFieldFilled(formData.mainChallenge)}>{t.contact.mainChallengeLabel}</FieldLabel>
              <Textarea
                id="mainChallenge"
                rows={2}
                placeholder={t.contact.mainChallengePlaceholder}
                value={formData.mainChallenge || ''}
                onChange={(e) => updateFormData('mainChallenge', e.target.value)}
                className={getInputClass(formData.mainChallenge)}
              />
            </div>
          )}

          {tier === 'core' && (
            <>
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="coreOperations" filled={!!formData.coreOperations?.length}>{t.contact.coreOperationsLabel}</FieldLabel>
                <CheckboxGrid
                  options={OPERATION_OPTIONS.map((o) => ({ id: o.id, label: t.contact.operationOptions[o.labelKey] }))}
                  selected={formData.coreOperations || []}
                  onToggle={(id) => toggleMulti('coreOperations', id)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="currentTools" filled={!!formData.currentTools?.length}>{t.contact.currentToolsLabel}</FieldLabel>
                <CheckboxGrid
                  options={TOOL_OPTIONS.map((o) => ({ id: o.id, label: t.contact.toolOptions[o.labelKey] }))}
                  selected={formData.currentTools || []}
                  onToggle={toggleTool}
                />
                {formData.currentTools?.includes('other') && (
                  <Input
                    placeholder={t.contact.currentToolsOtherPlaceholder}
                    value={formData.currentToolsOther || ''}
                    onChange={(e) => updateFormData('currentToolsOther', e.target.value)}
                    className={getInputClass(formData.currentToolsOther)}
                  />
                )}
              </div>

              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="timeline" filled={isFieldFilled(formData.timeline)}>{t.contact.timelineLabel}</FieldLabel>
                <select
                  id="timeline"
                  className={getSelectClass(formData.timeline)}
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
            </>
          )}

          {tier === 'pro' && (
            <>
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="proCapabilities" filled={!!formData.proCapabilities?.length}>{t.contact.capabilitiesLabel}</FieldLabel>
                <CheckboxGrid
                  options={CAPABILITY_OPTIONS.map((o) => ({ id: o.id, label: t.contact.capabilityOptions[o.labelKey] }))}
                  selected={formData.proCapabilities || []}
                  onToggle={(id) => toggleMulti('proCapabilities', id)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="monthlyVolume" filled={isFieldFilled(formData.monthlyVolume)}>{t.contact.monthlyVolumeLabel}</FieldLabel>
                <select
                  id="monthlyVolume"
                  className={getSelectClass(formData.monthlyVolume)}
                  value={formData.monthlyVolume || ''}
                  onChange={(e) => updateFormData('monthlyVolume', e.target.value)}
                >
                  <option value="">{t.contact.selectOption}</option>
                  {t.contact.monthlyVolumeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {tier === 'bespoke' && (
            <>
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="currentTools" filled={!!formData.currentTools?.length}>{t.contact.currentToolsLabel}</FieldLabel>
                <CheckboxGrid
                  options={TOOL_OPTIONS.map((o) => ({ id: o.id, label: t.contact.toolOptions[o.labelKey] }))}
                  selected={formData.currentTools || []}
                  onToggle={toggleTool}
                />
                {formData.currentTools?.includes('other') && (
                  <Input
                    placeholder={t.contact.currentToolsOtherPlaceholder}
                    value={formData.currentToolsOther || ''}
                    onChange={(e) => updateFormData('currentToolsOther', e.target.value)}
                    className={getInputClass(formData.currentToolsOther)}
                  />
                )}
              </div>

              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="deployment" filled={isFieldFilled(formData.deployment)}>{t.contact.deploymentLabel}</FieldLabel>
                <select
                  id="deployment"
                  className={getSelectClass(formData.deployment)}
                  value={formData.deployment || ''}
                  onChange={(e) => updateFormData('deployment', e.target.value)}
                >
                  <option value="">{t.contact.selectOption}</option>
                  {t.contact.deploymentOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="budgetRange" filled={isFieldFilled(formData.budgetRange)}>{t.contact.budgetLabel}</FieldLabel>
                <select
                  id="budgetRange"
                  className={getSelectClass(formData.budgetRange)}
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

          {getStep2Missing().length > 0 && (
            <p className="text-xs text-muted-foreground">
              {t.contact.stillNeeded}{' '}
              <span className="text-foreground/80">{getStep2Missing().join(' · ')}</span>
            </p>
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
                <>
                  {t.contact.continueToSchedule}
                  <ArrowRight className="ml-2 size-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </>
    )
  }

  function renderSchedule() {
    return (
      <>
        <DialogHeader>
          <DialogTitle>{t.contact.step3Header}</DialogTitle>
          <DialogDescription>{t.contact.step3Description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card/40 py-6 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Check className="size-6" />
            </span>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t.contact.scheduleComingSoon}
            </p>
          </div>

          <Button variant="secondary" onClick={() => setIsOpen(false)} className="w-full">
            {t.contact.close}
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
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto border border-primary/30">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderSchedule()}
          {step === 'error' && renderError()}
        </DialogContent>
      </Dialog>
    </ContactContext.Provider>
  )
}
