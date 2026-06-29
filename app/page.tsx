import { ContactProvider } from '@/components/contact-modal'
import { SiteNav } from '@/components/site-nav'
import { Hero } from '@/components/sections/hero'
import { Problem } from '@/components/sections/problem'
import { Solution } from '@/components/sections/solution'
import { Services } from '@/components/sections/services'
import { GettingStarted } from '@/components/sections/getting-started'
import { CaseStudy } from '@/components/sections/case-study'
import { About } from '@/components/sections/about'
import { Pricing } from '@/components/sections/pricing'
import { FinalCta } from '@/components/sections/final-cta'
import { Footer } from '@/components/sections/footer'

export default function Page() {
  return (
    <ContactProvider>
      <SiteNav />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Services />
        <GettingStarted />
        <CaseStudy />
        <About />
        <Pricing />
        <FinalCta />
      </main>
      <Footer />
    </ContactProvider>
  )
}
