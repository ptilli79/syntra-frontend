'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { faqItemsEn, faqItemsEs } from '@/lib/faq'

export type Language = 'en' | 'es'

const STORAGE_KEY = 'syntra-lang'

type Dict = {
  nav: {
    services: string
    gettingStarted: string
    about: string
    pricing: string
    scheduleCall: string
    openMenu: string
    closeMenu: string
    languageToggleAria: string
  }
  hero: {
    eyebrow: string
    titleLine1: string
    titleLine2: string
    subtitle: string
    body: string
    ctaPrimary: string
    ctaSecondary: string
  }
  problem: {
    eyebrow: string
    title: string
    body: string
    items: string[]
  }
  solution: {
    title: string
    body: string
    withSyntra: string
    items: string[]
  }
  services: {
    eyebrow: string
    title: string
    items: Array<{ tag: string; title: string; desc: string }>
  }
  gettingStarted: {
    eyebrow: string
    title: string
    body: string
    steps: Array<{ title: string; desc: string }>
  }
  caseStudy: {
    eyebrow: string
    titleA: string
    titleB: string
    body: string
    beforeLabel: string
    afterLabel: string
    before: string[]
    after: string[]
    quote: string
    quoteFooter: string
  }
  about: {
    eyebrow: string
    title: string
    body: string
    closing: string
    founders: Array<{
      name: string
      role: string
      location: string
      bio: string
      tags: string[]
    }>
    linkedinAria: (name: string) => string
    portraitAlt: (name: string) => string
  }
  pricing: {
    eyebrow: string
    title: string
    body: string
    mostCommon: string
    footnote: string
    tiers: Array<{
      name: string
      price: string
      priceSuffix?: string
      sub: string
      desc: string
      features: string[]
      cta: string
    }>
  }
  faq: {
    eyebrow: string
    title: string
    body: string
    items: Array<{ q: string; a: string }>
  }
  finalCta: {
    titleA: string
    titleB: string
    body: string
    cta: string
  }
  footer: {
    trust: string[]
    copyright: (year: number) => string
    privacy: string
    contact: string
    contactIntent: string
  }
  contact: {
    fallbackTitle: string
    description: string
    nameLabel: string
    namePlaceholder: string
    emailLabel: string
    emailPlaceholder: string
    companyLabel: string
    companyPlaceholder: string
    messageLabel: string
    messagePlaceholder: string
    submit: string
    preferEmail: string
    receivedTitle: string
    receivedBody: string
    close: string
    // Multi-step form additions
    step1Title: string
    step2Title: string
    step2Header: string
    step2Description: string
    step3Title: string
    step3Header: string
    step3Description: string
    scheduleComingSoon: string
    openBookingPage: string
    sendDetailsInstead: string
    continueToSchedule: string
    stepOf: (current: number, total: number, title: string) => string
    next: string
    back: string
    sending: string
    selectOption: string
    industryLabel: string
    industryPlaceholder: string
    teamSizeLabel: string
    teamSizeOptions: string[]
    mainChallengeLabel: string
    mainChallengePlaceholder: string
    currentToolsLabel: string
    toolOptions: {
      excel: string
      inhouse: string
      commercial: string
      whatsapp: string
      manual: string
      other: string
      none: string
    }
    currentToolsOtherPlaceholder: string
    coreOperationsLabel: string
    operationOptions: {
      inventory: string
      sales: string
      purchasing: string
      customers: string
      quotations: string
    }
    capabilitiesLabel: string
    capabilityOptions: {
      aiAssistant: string
      whatsappAgent: string
      analytics: string
      rotation: string
      autoQuotations: string
    }
    monthlyVolumeLabel: string
    monthlyVolumeOptions: string[]
    deploymentLabel: string
    deploymentOptions: string[]
    timelineLabel: string
    timelineOptions: string[]
    budgetLabel: string
    budgetOptions: string[]
    expectedGrowthLabel: string
    growthOptions: string[]
    partnershipGoalsLabel: string
    partnershipGoalsPlaceholder: string
    errorTitle: string
    errorBody: string
    tryAgain: string
    invalidEmail: string
    stillNeeded: string
  }
}

const en: Dict = {
  nav: {
    services: 'Services',
    gettingStarted: 'Getting Started',
    about: 'About',
    pricing: 'Pricing',
    scheduleCall: 'Schedule a Call',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    languageToggleAria: 'Switch language',
  },
  hero: {
    eyebrow: 'Custom Business Operating Systems',
    titleLine1: 'Everything synthesized.',
    titleLine2: 'Nothing scattered.',
    subtitle:
      'Custom Business Operating Systems & Workflow Automation Software — connecting inventory, sales, purchasing, CRM, and AI co-pilots.',
    body: 'We design custom operating systems that connect your workflows, customer conversations, scheduling, inventory, and business data into one intelligent platform.',
    ctaPrimary: 'Schedule a Strategy Session',
    ctaSecondary: 'See How It Works',
  },
  problem: {
    eyebrow: 'The Problem',
    title: 'Your business is running in fragments.',
    body: "Your tools don't talk. Your data lives in silos. Your team becomes the integration layer — spending hours on reconciliation that should be automatic.",
    items: [
      'Context lost between every handoff',
      "Manual work that shouldn't exist",
      'Decisions made on incomplete data',
    ],
  },
  solution: {
    title: 'One interface. One source of truth.',
    body: 'Syntra connects every system, conversation, and data point into a unified platform designed specifically for how your business operates.',
    withSyntra: 'With Syntra',
    items: [
      'Conversations',
      'Scheduling',
      'CRM',
      'Inventory',
      'Sales & Invoicing',
      'Purchasing',
      'Live Reporting',
      'AI Co-Pilot',
    ],
  },
  services: {
    eyebrow: 'Services',
    title: 'What we design for you.',
    items: [
      {
        tag: 'Omnichannel',
        title: 'Customer Communication Systems',
        desc: 'Handle conversations across every channel customers already use — unified, contextual, and tracked.',
      },
      {
        tag: 'Automation',
        title: 'Workflow Automation',
        desc: 'Remove repetitive manual work. Every action that can be automated, is — reliably and invisibly.',
      },
      {
        tag: 'Infrastructure',
        title: 'Business Operations Platforms',
        desc: 'Connect the systems that run your business. Scheduling, inventory, CRM, and reporting in one place.',
      },
      {
        tag: 'Intelligence',
        title: 'AI Assistants',
        desc: 'Ask your business questions in natural language using real company data. Intelligence without configuration.',
      },
    ],
  },
  gettingStarted: {
    eyebrow: 'How It Works',
    title: 'Getting Started',
    body: "From first conversation to live system, here's exactly what working with Syntra looks like.",
    steps: [
      { title: 'Discovery', desc: 'We map every tool, workflow, gap, and friction point in your current operations.' },
      { title: 'System Design', desc: 'We architect your operating system before a single line of code is written.' },
      { title: 'Integration', desc: 'We connect existing tools and build custom infrastructure where gaps exist.' },
      { title: 'Deployment', desc: 'We go live with your team — training, documentation, and a smooth handoff included.' },
      { title: 'Support & Optimization', desc: 'Ongoing support, continuous improvement, and system expansion as your business grows.' },
    ],
  },
  caseStudy: {
    eyebrow: 'Case Study · Digital Transformation for Independent Auto Repair Shops',
    titleA: 'A mechanic shop running on intuition.',
    titleB: ' Now running on intelligence.',
    body: 'A local auto repair business managed everything manually — calls, calendars, parts, and records. We designed a complete operating system that replaced fragmented chaos with connected clarity.',
    beforeLabel: 'Before Syntra',
    afterLabel: 'After Syntra',
    before: [
      'Excel spreadsheets for job tracking',
      'Manual phone scheduling',
      'Inventory tracked by hand',
      'No revenue or margin visibility',
      'Customer follow-up missed regularly',
      'Parts pricing recalculated manually each time the FX rate moves',
    ],
    after: [
      'Unified operating platform, one screen',
      'Automated scheduling with SMS notifications',
      'Real-time inventory across parts and labor',
      'AI-powered business intelligence on demand',
      'Every customer interaction logged and actionable',
      'Live USD→MXN pricing on imported parts, updated daily',
    ],
    quote:
      '"We went from running the shop in our heads to running it from one screen. Everything is connected now."',
    quoteFooter: '— Owner, independent auto repair shop',
  },
  about: {
    eyebrow: 'About Us',
    title: 'Built by operators, for operators.',
    body: 'Syntra was founded by two people who spent careers watching businesses fail at the seams between their tools. We decided to fix it by design, not by accident.',
    closing:
      'Together, Ana and Pierpaolo bring a rare combination of business strategy and technical depth — the two things every operating system requires.',
    founders: [
      {
        name: 'Ana Algernon Luján',
        role: 'Co-Founder & Head of People & Operations',
        location: 'Toronto, Canada',
        bio: 'Ana brings over a decade of talent and people strategy to Syntra. She spent eight years at CPP Investments — one of the world’s largest institutional investors — as a Senior Talent Advisor and HR Business Partner, and before that recruited technical talent for Canada’s Big Five banks. Along the way she learned how complex organizations are really structured, how teams are built, and what makes them succeed or stall. With an Honours degree in Psychology and formal training in Human Resources, Ana understands the part of every system that technology tends to forget: the people who actually use it. That focus shapes how Syntra designs — she makes sure each system fits how real teams work, communicate, and adopt new tools, so the technology gets embraced instead of resisted. Because a business doesn’t run on software alone; it runs on the people the software is meant to serve.',
        tags: ['Talent & People Strategy', 'HR Business Partnering', 'Organizational Insight', 'Bilingual'],
      },
      {
        name: 'Pierpaolo Tilli',
        role: 'Co-Founder & Systems Architect',
        location: 'Jersey City, NJ',
        bio: 'Pierpaolo brings nearly two decades of telecommunications and software engineering to Syntra, built across Venezuela, Mexico, and the United States. He has lived every layer of the industry — starting hands-on in network support, then leading a 50-engineer delivery organization, running carrier programs at 98% SLA compliance with millions in cost savings, and architecting solutions for operators like AT&T and Telefónica. Today, as a Senior Software Engineer for a company serving the world’s largest telcos, he builds APIs in Java (Spring Boot) and Python, works daily with graph databases like Neo4j, and engineers the automation and orchestration pipelines that make complex systems run themselves — the very foundation Syntra is built on. That rare blend of enterprise-grade engineering, delivery leadership, and customer-facing discipline is what lets him turn a business’s scattered tools and data into an operating system dependable enough to run everything on.',
        tags: ['Software Engineering', 'Automation & Graph Databases', 'Telecom & 5G Networks', 'Delivery Leadership'],
      },
    ],
    linkedinAria: (name) => `${name} on LinkedIn`,
    portraitAlt: (name) => `Portrait of ${name}`,
  },
  pricing: {
    eyebrow: 'Fee Structure',
    title: 'Transparent, project-based pricing.',
    body: "Every engagement is scoped to your operations. No subscriptions to software you won't use — only the system your business actually needs.",
    mostCommon: 'Most Common',
    footnote:
      'All projects begin with a complimentary Strategy Session. Final pricing is determined after scoping — every business is different.',
    tiers: [
      {
        name: 'Strategy Session',
        price: 'Complimentary',
        sub: 'First engagement',
        desc: 'Your first conversation with Syntra — a focused discovery session to understand your business, map how your operations run today, and explore whether Syntra Systems is the right fit for where your business is headed.',
        features: [
          'Operations audit and gap analysis',
          'Current tools and workflow review',
          'System architecture review',
          'Roadmap planning and next steps',
        ],
        cta: 'Book Session',
      },
      {
        name: 'Core',
        price: '$297',
        priceSuffix: '/mo',
        sub: '+ $250 setup fee',
        desc: 'The essential operating layer for growing businesses. Manage your inventory, sales, and purchasing with real-time visibility across your operations.',
        features: [
          'Operations dashboard with live metrics',
          'Directory — customers, providers, employees & vehicles',
          'Parts inventory with live stock',
          'Sales & purchase orders with live USD→MXN rate',
          'Quotation builder with Excel/PDF export',
          'Email support',
        ],
        cta: 'Request Demo',
      },
      {
        name: 'Pro',
        price: '$397',
        priceSuffix: '/mo',
        sub: '+ $450 setup fee',
        desc: 'The full Syntra platform for businesses ready to operate at a higher level. Everything connected, automated, and intelligent.',
        features: [
          'Everything in Core',
          'AI assistant for quotations & insights',
          'WhatsApp Business messaging agent',
          'Advanced analytics & inventory rotation',
          'Automatic quotation creation & status tracking',
          'Priority support',
          'Annual strategy session',
        ],
        cta: 'Request Demo',
      },
      {
        name: 'Bespoke',
        price: 'From $7,398',
        sub: 'one-time · no recurring fees',
        desc: 'A fully custom operating system designed, integrated, and deployed for your business. Scoped to your operations — no templates, no shortcuts.',
        features: [
          'Complete discovery and system mapping',
          'Custom platform architecture',
          'Tool integrations and automations',
          'AI assistant configuration',
          'Cloud or on-premises deployment',
          'You own the source code',
          'Team training and documentation',
          '60-day post-launch support',
          'Optional ongoing support & maintenance',
        ],
        cta: 'Talk to Us',
      },
    ],
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Questions, answered.',
    body: 'The practical details behind working with Syntra — engagement, payments, support, and ownership. If something isn\u2019t covered here, a Strategy Session is the best place to ask.',
    items: faqItemsEn,
  },
  finalCta: {
    titleA: 'Your business already has the information.',
    titleB: 'It just needs a system.',
    body: "We'll map your current operations, identify every gap, and design the system that eliminates them.",
    cta: 'Contact Us',
  },  footer: {
    trust: [
      'Encrypted daily backups',
      'Role-based access',
      'HTTPS · JWT auth',
      '99.9% target uptime',
    ],
    copyright: (year) =>
      `© ${year} Syntra Systems. Custom Business Operating Systems.`,
    privacy: 'Privacy',
    contact: 'Contact',
    contactIntent: 'Contact Syntra',
  },
  contact: {
    fallbackTitle: 'Schedule a Call',
    description:
      "Tell us a bit about your business and we'll be in touch to set up a time.",
    nameLabel: 'Name',
    namePlaceholder: 'Jane Operator',
    emailLabel: 'Work email',
    emailPlaceholder: 'jane@company.com',
    companyLabel: 'Company',
    companyPlaceholder: 'Company name',
    messageLabel: 'What are you trying to fix?',
    messagePlaceholder:
      'Tell us about the systems and workflows you want to connect.',
    submit: 'Send request',
    preferEmail: 'Prefer email? Reach us at',
    receivedTitle: 'Request received',
    receivedBody:
      'Thanks for sharing your details. Our team will review your information and follow up within three business days with a tailored assessment and recommended next steps.',
    close: 'Close',
    // Multi-step form additions
    step1Title: 'Your info',
    step2Title: 'Business details',
    step2Header: 'A few more details',
    step2Description: 'This helps us prepare for your session.',
    step3Title: 'Schedule a Call',
    step3Header: 'Pick a time',
    step3Description:
      "Choose a slot that works for you — you'll get a calendar invite with a Google Meet link.",
    scheduleComingSoon:
      "Online scheduling is under construction — for now, we'll email you within one business day to lock in a time that works.",
    openBookingPage: 'Open booking page',
    sendDetailsInstead: 'Prefer to just send your details?',
    continueToSchedule: 'Schedule a Call',
    stepOf: (current, total, title) => `Step ${current} of ${total} — ${title}`,
    next: 'Continue',
    back: 'Back',
    sending: 'Sending...',
    selectOption: 'Select an option',
    industryLabel: 'Industry / Business Type',
    industryPlaceholder: 'e.g., Auto repair, Retail, Professional services',
    teamSizeLabel: 'Number of employees',
    teamSizeOptions: ['Just me', '2-5 people', '6-15 people', '16-50 people', '50+ people'],
    mainChallengeLabel: 'What is your main operational challenge?',
    mainChallengePlaceholder: 'Describe the biggest friction point in your daily operations.',
    currentToolsLabel: 'What tools are you currently using?',
    toolOptions: {
      excel: 'Excel / Spreadsheets',
      inhouse: 'In-house / custom software',
      commercial: 'Commercial software (CRM/ERP/POS)',
      whatsapp: 'WhatsApp / Messaging',
      manual: 'Pen & paper / Manual',
      other: 'Other',
      none: 'None',
    },
    currentToolsOtherPlaceholder: 'Tell us which one',
    coreOperationsLabel: 'Which operations do you most need to organize?',
    operationOptions: {
      inventory: 'Inventory',
      sales: 'Sales',
      purchasing: 'Purchasing',
      customers: 'Customers',
      quotations: 'Quotations',
    },
    capabilitiesLabel: 'Which capabilities matter most?',
    capabilityOptions: {
      aiAssistant: 'AI assistant',
      whatsappAgent: 'WhatsApp messaging',
      analytics: 'Advanced analytics',
      rotation: 'Inventory rotation',
      autoQuotations: 'Automated quotations',
    },
    monthlyVolumeLabel: 'Approx. monthly sales / orders',
    monthlyVolumeOptions: ['Under 50', '50–200', '200–1,000', '1,000+', 'Not sure'],
    deploymentLabel: 'Deployment preference',
    deploymentOptions: ['Cloud', 'On-premises', 'Not sure'],
    timelineLabel: 'Desired Timeline',
    timelineOptions: ['ASAP', '1-3 months', '3-6 months', 'Flexible / Planning ahead'],
    budgetLabel: 'Intended budget (one-time)',
    budgetOptions: ['$6,000 – $12,000 USD', '$12,000 – $25,000 USD', '$25,000 – $50,000 USD', '$50,000+ USD', 'Not sure yet'],
    expectedGrowthLabel: 'Expected Business Growth',
    growthOptions: ['Maintaining current operations', 'Moderate growth (10-25%)', 'Significant growth (25-50%)', 'Rapid expansion (50%+)'],
    partnershipGoalsLabel: 'What do you hope to achieve with ongoing support?',
    partnershipGoalsPlaceholder: 'e.g., System optimization, new feature development, scaling support',
    errorTitle: 'Something went wrong',
    errorBody: 'We couldn\'t send your request. Please try again or email us directly.',
    tryAgain: 'Try Again',
    invalidEmail: 'Please enter a valid email address',
    stillNeeded: 'Still needed:',
  },
}

const es: Dict = {
  nav: {
    services: 'Servicios',
    gettingStarted: 'Cómo Empezar',
    about: 'Nosotros',
    pricing: 'Precios',
    scheduleCall: 'Agendar Llamada',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    languageToggleAria: 'Cambiar idioma',
  },
  hero: {
    eyebrow: 'Sistemas Operativos de Negocio a Medida',
    titleLine1: 'Todo sintetizado.',
    titleLine2: 'Nada disperso.',
    subtitle:
      'Sistemas Operativos de Negocio a Medida y Software de Automatización de Flujos — conectando inventario, ventas, compras, CRM y co-pilotos de IA.',
    body: 'Diseñamos sistemas operativos a medida que conectan tus flujos de trabajo, las conversaciones con clientes, la agenda, el inventario y los datos del negocio en una sola plataforma inteligente.',
    ctaPrimary: 'Agenda una Sesión Estratégica',
    ctaSecondary: 'Ver Cómo Funciona',
  },
  problem: {
    eyebrow: 'El Problema',
    title: 'Tu negocio opera en fragmentos.',
    body: 'Tus herramientas no se comunican. Tus datos viven en silos. Tu equipo se convierte en la capa de integración — dedicando horas a reconciliar lo que debería ser automático.',
    items: [
      'Contexto perdido en cada traspaso',
      'Trabajo manual que no debería existir',
      'Decisiones tomadas con datos incompletos',
    ],
  },
  solution: {
    title: 'Una interfaz. Una sola fuente de verdad.',
    body: 'Syntra conecta cada sistema, conversación y dato en una plataforma unificada, diseñada específicamente para cómo opera tu negocio.',
    withSyntra: 'Con Syntra',
    items: [
      'Conversaciones',
      'Agenda',
      'CRM',
      'Inventario',
      'Ventas y Facturación',
      'Compras',
      'Reportes en Vivo',
      'Co-Piloto IA',
    ],
  },
  services: {
    eyebrow: 'Servicios',
    title: 'Lo que diseñamos para ti.',
    items: [
      {
        tag: 'Omnicanal',
        title: 'Sistemas de Comunicación con Clientes',
        desc: 'Gestiona conversaciones en todos los canales que tus clientes ya usan — unificadas, contextuales y trazables.',
      },
      {
        tag: 'Automatización',
        title: 'Automatización de Flujos de Trabajo',
        desc: 'Elimina el trabajo manual repetitivo. Cada acción que puede automatizarse, se automatiza — de forma confiable e invisible.',
      },
      {
        tag: 'Infraestructura',
        title: 'Plataformas de Operaciones',
        desc: 'Conecta los sistemas que mueven tu negocio. Agenda, inventario, CRM y reportes en un solo lugar.',
      },
      {
        tag: 'Inteligencia',
        title: 'Asistentes de IA',
        desc: 'Haz preguntas a tu negocio en lenguaje natural usando datos reales de la empresa. Inteligencia sin configuración.',
      },
    ],
  },
  gettingStarted: {
    eyebrow: 'Cómo Funciona',
    title: 'Cómo Empezar',
    body: 'Desde la primera conversación hasta el sistema en producción, así es trabajar con Syntra.',
    steps: [
      { title: 'Descubrimiento', desc: 'Mapeamos cada herramienta, flujo, brecha y punto de fricción en tus operaciones actuales.' },
      { title: 'Diseño del Sistema', desc: 'Diseñamos la arquitectura de tu sistema operativo antes de escribir una sola línea de código.' },
      { title: 'Integración', desc: 'Conectamos las herramientas existentes y construimos infraestructura a medida donde hay brechas.' },
      { title: 'Despliegue', desc: 'Salimos a producción con tu equipo — incluye capacitación, documentación y un traspaso fluido.' },
      { title: 'Soporte y Optimización', desc: 'Soporte continuo, mejora constante y expansión del sistema conforme tu negocio crece.' },
    ],
  },
  caseStudy: {
    eyebrow: 'Caso de Estudio · Transformación Digital para Talleres Automotrices Independientes',
    titleA: 'Un taller mecánico que operaba por intuición.',
    titleB: ' Ahora opera con inteligencia.',
    body: 'Un taller de reparación automotriz local gestionaba todo de forma manual — llamadas, calendarios, refacciones y registros. Diseñamos un sistema operativo completo que reemplazó el caos fragmentado con claridad conectada.',
    beforeLabel: 'Antes de Syntra',
    afterLabel: 'Después de Syntra',
    before: [
      'Hojas de Excel para dar seguimiento a los trabajos',
      'Agendado telefónico manual',
      'Inventario llevado a mano',
      'Sin visibilidad de ingresos ni margen',
      'Seguimiento a clientes que se perdía con regularidad',
      'Precios de refacciones recalculados manualmente cada vez que se mueve el tipo de cambio',
    ],
    after: [
      'Plataforma operativa unificada, en una sola pantalla',
      'Agendado automatizado con notificaciones por SMS',
      'Inventario en tiempo real para refacciones y mano de obra',
      'Inteligencia de negocio con IA a la orden',
      'Cada interacción con el cliente registrada y accionable',
      'Precios USD→MXN en vivo para refacciones importadas, actualizados a diario',
    ],
    quote:
      '"Pasamos de llevar el taller en la cabeza a llevarlo desde una sola pantalla. Ahora todo está conectado."',
    quoteFooter: '— Propietario, taller automotriz independiente',
  },
  about: {
    eyebrow: 'Sobre Nosotros',
    title: 'Construido por operadores, para operadores.',
    body: 'Syntra fue fundada por dos personas que dedicaron sus carreras a ver cómo los negocios fallaban en las costuras entre sus herramientas. Decidimos resolverlo por diseño, no por accidente.',
    closing:
      'Juntos, Ana y Pierpaolo aportan una combinación poco común de estrategia de negocio y profundidad técnica — las dos cosas que todo sistema operativo requiere.',
    founders: [
      {
        name: 'Ana Algernon Luján',
        role: 'Cofundadora y Líder de Personas y Operaciones',
        location: 'Toronto, Canadá',
        bio: 'Ana aporta a Syntra más de una década de estrategia de talento y personas. Pasó ocho años en CPP Investments — uno de los inversionistas institucionales más grandes del mundo — como Senior Talent Advisor y HR Business Partner, y antes reclutó talento técnico para los cinco grandes bancos de Canadá. En el camino aprendió cómo se estructuran realmente las organizaciones complejas, cómo se forman los equipos y qué los hace prosperar o estancarse. Con una licenciatura con honores en Psicología y formación en Recursos Humanos, Ana entiende la parte de todo sistema que la tecnología suele olvidar: las personas que realmente lo usan. Ese enfoque moldea cómo diseña Syntra — se asegura de que cada sistema se ajuste a cómo trabajan, se comunican y adoptan nuevas herramientas los equipos reales, para que la tecnología se abrace en lugar de resistirse. Porque un negocio no funciona solo con software; funciona con las personas a las que el software debe servir.',
        tags: ['Estrategia de Talento y Personas', 'HR Business Partnering', 'Visión Organizacional', 'Bilingüe'],
      },
      {
        name: 'Pierpaolo Tilli',
        role: 'Cofundador y Arquitecto de Sistemas',
        location: 'Jersey City, NJ',
        bio: 'Pierpaolo aporta a Syntra casi dos décadas de telecomunicaciones e ingeniería de software, construidas entre Venezuela, México y Estados Unidos. Ha vivido cada capa de la industria — desde el soporte de red con las manos en la infraestructura, hasta liderar una organización de entrega de 50 ingenieros, gestionar programas para operadores con 98% de cumplimiento de SLA y millones en ahorros, y diseñar la arquitectura de soluciones para operadores como AT&T y Telefónica. Hoy, como Senior Software Engineer en una empresa que da servicio a los telcos más grandes del mundo, construye APIs en Java (Spring Boot) y Python, trabaja a diario con bases de datos de grafos como Neo4j y diseña los pipelines de automatización y orquestación que hacen que los sistemas complejos funcionen solos — justo la base sobre la que está construido Syntra. Esa combinación poco común de ingeniería de nivel empresarial, liderazgo de entrega y trato directo con el cliente es lo que le permite convertir las herramientas y los datos dispersos de un negocio en un sistema operativo lo suficientemente confiable como para dirigirlo todo.',
        tags: ['Ingeniería de Software', 'Automatización y Bases de Grafos', 'Telecom y Redes 5G', 'Liderazgo de Entrega'],
      },
    ],
    linkedinAria: (name) => `${name} en LinkedIn`,
    portraitAlt: (name) => `Retrato de ${name}`,
  },
  pricing: {
    eyebrow: 'Estructura de Tarifas',
    title: 'Precios transparentes, por proyecto.',
    body: 'Cada proyecto se ajusta a tus operaciones. Sin suscripciones a software que no usarás — solo el sistema que tu negocio realmente necesita.',
    mostCommon: 'Más Común',
    footnote:
      'Todos los proyectos comienzan con una Sesión Estratégica de cortesía. El precio final se determina después de definir el alcance — cada negocio es diferente.',
    tiers: [
      {
        name: 'Sesión Estratégica',
        price: 'De Cortesía',
        sub: 'Primer contacto',
        desc: 'Tu primera conversación con Syntra — una sesión de descubrimiento enfocada para entender tu negocio, mapear cómo operan tus flujos actuales y evaluar si Syntra Systems es la opción correcta para hacia dónde vas.',
        features: [
          'Auditoría de operaciones y análisis de brechas',
          'Revisión de herramientas y flujos actuales',
          'Revisión de la arquitectura del sistema',
          'Planeación de la hoja de ruta y próximos pasos',
        ],
        cta: 'Agendar Sesión',
      },
      {
        name: 'Core',
        price: '$5,900',
        priceSuffix: 'MXN/mes',
        sub: '+ $5,000 MXN de implementación',
        desc: 'La capa operativa esencial para negocios en crecimiento. Administra tu inventario, ventas y compras con visibilidad en tiempo real de tus operaciones.',
        features: [
          'Panel de operaciones con métricas en vivo',
          'Directorio — clientes, proveedores, empleados y vehículos',
          'Inventario de partes con stock en vivo',
          'Ventas y órdenes de compra con tipo de cambio USD→MXN en vivo',
          'Generador de cotizaciones con exportación a Excel/PDF',
          'Soporte por correo',
        ],
        cta: 'Solicitar Demo',
      },
      {
        name: 'Pro',
        price: '$7,900',
        priceSuffix: 'MXN/mes',
        sub: '+ $9,000 MXN de implementación',
        desc: 'La plataforma completa de Syntra para negocios listos para operar a un nivel superior. Todo conectado, automatizado e inteligente.',
        features: [
          'Todo lo de Core',
          'Asistente de IA para cotizaciones y análisis',
          'Agente de mensajería de WhatsApp Business',
          'Analítica avanzada y rotación de inventario',
          'Creación automática de cotización y control de estatus',
          'Soporte prioritario',
          'Sesión estratégica anual',
        ],
        cta: 'Solicitar Demo',
      },
      {
        name: 'A Medida',
        price: 'Desde $124,000',
        priceSuffix: 'MXN',
        sub: 'pago único · sin cuotas recurrentes',
        desc: 'Un sistema operativo totalmente a medida, diseñado, integrado y desplegado para tu negocio. Ajustado a tus operaciones — sin plantillas, sin atajos.',
        features: [
          'Descubrimiento completo y mapeo del sistema',
          'Arquitectura de plataforma a medida',
          'Integraciones y automatizaciones',
          'Configuración de asistente de IA',
          'Despliegue en la nube o en sitio',
          'Eres dueño del código fuente',
          'Capacitación y documentación del equipo',
          'Soporte post-lanzamiento por 60 días',
          'Soporte y mantenimiento continuo opcional',
        ],
        cta: 'Hablemos',
      },
    ],
  },
  faq: {
    eyebrow: 'Preguntas Frecuentes',
    title: 'Preguntas, respondidas.',
    body: 'Los detalles pr\u00e1cticos de trabajar con Syntra \u2014 el proceso, pagos, soporte y propiedad. Si algo no aparece aqu\u00ed, una Sesi\u00f3n Estrat\u00e9gica es el mejor lugar para preguntarlo.',
    items: faqItemsEs,
  },
  finalCta: {
    titleA: 'Tu negocio ya tiene la información.',
    titleB: 'Solo le falta un sistema.',
    body: 'Mapearemos tus operaciones actuales, identificaremos cada brecha y diseñaremos el sistema que las elimina.',
    cta: 'Contáctanos',
  },
  footer: {
    trust: [
      'Respaldos diarios cifrados',
      'Acceso basado en roles',
      'HTTPS · Autenticación JWT',
      'Disponibilidad objetivo 99.9%',
    ],
    copyright: (year) =>
      `© ${year} Syntra Systems. Sistemas Operativos de Negocio a Medida.`,
    privacy: 'Privacidad',
    contact: 'Contacto',
    contactIntent: 'Contactar a Syntra',
  },
  contact: {
    fallbackTitle: 'Agendar una Llamada',
    description:
      'Cuéntanos un poco sobre tu negocio y nos pondremos en contacto para coordinar un horario.',
    nameLabel: 'Nombre',
    namePlaceholder: 'Jane Operator',
    emailLabel: 'Correo de trabajo',
    emailPlaceholder: 'jane@empresa.com',
    companyLabel: 'Empresa',
    companyPlaceholder: 'Nombre de la empresa',
    messageLabel: '¿Qué quieres resolver?',
    messagePlaceholder:
      'Cuéntanos sobre los sistemas y flujos que quieres conectar.',
    submit: 'Enviar solicitud',
    preferEmail: '¿Prefieres correo? Escríbenos a',
    receivedTitle: 'Solicitud recibida',
    receivedBody:
      'Gracias por compartir tus datos. Nuestro equipo revisará tu información y te contactará en un plazo de tres días hábiles con una evaluación personalizada y los siguientes pasos recomendados.',
    close: 'Cerrar',
    // Multi-step form additions
    step1Title: 'Tu información',
    step2Title: 'Detalles del negocio',
    step2Header: 'Algunos detalles más',
    step2Description: 'Esto nos ayuda a prepararnos para tu sesión.',
    step3Title: 'Agendar una Llamada',
    step3Header: 'Elige un horario',
    step3Description:
      'Elige el horario que mejor te convenga — recibirás una invitación de calendario con un enlace de Google Meet.',
    scheduleComingSoon:
      'El agendado en línea está en construcción — por ahora, te enviaremos un correo en un día hábil para coordinar un horario.',
    openBookingPage: 'Abrir página de reservación',
    sendDetailsInstead: '¿Prefieres solo enviar tus datos?',
    continueToSchedule: 'Agendar Llamada',
    stepOf: (current, total, title) => `Paso ${current} de ${total} — ${title}`,
    next: 'Continuar',
    back: 'Atrás',
    sending: 'Enviando...',
    selectOption: 'Selecciona una opción',
    industryLabel: 'Industria / Tipo de Negocio',
    industryPlaceholder: 'ej., Taller mecánico, Retail, Servicios profesionales',
    teamSizeLabel: 'Número de empleados',
    teamSizeOptions: ['Solo yo', '2-5 personas', '6-15 personas', '16-50 personas', '50+ personas'],
    mainChallengeLabel: '¿Cuál es tu principal reto operativo?',
    mainChallengePlaceholder: 'Describe el mayor punto de fricción en tus operaciones diarias.',
    currentToolsLabel: '¿Qué herramientas usas actualmente?',
    toolOptions: {
      excel: 'Excel / Hojas de cálculo',
      inhouse: 'Software interno / a medida',
      commercial: 'Software comercial (CRM/ERP/POS)',
      whatsapp: 'WhatsApp / Mensajería',
      manual: 'Papel y lápiz / Manual',
      other: 'Otro',
      none: 'Ninguno',
    },
    currentToolsOtherPlaceholder: 'Cuéntanos cuál',
    coreOperationsLabel: '¿Qué operaciones necesitas organizar primero?',
    operationOptions: {
      inventory: 'Inventario',
      sales: 'Ventas',
      purchasing: 'Compras',
      customers: 'Clientes',
      quotations: 'Cotizaciones',
    },
    capabilitiesLabel: '¿Qué capacidades te importan más?',
    capabilityOptions: {
      aiAssistant: 'Asistente de IA',
      whatsappAgent: 'Mensajería de WhatsApp',
      analytics: 'Analítica avanzada',
      rotation: 'Rotación de inventario',
      autoQuotations: 'Cotizaciones automatizadas',
    },
    monthlyVolumeLabel: 'Ventas / órdenes mensuales aprox.',
    monthlyVolumeOptions: ['Menos de 50', '50–200', '200–1,000', '1,000+', 'No estoy seguro'],
    deploymentLabel: 'Preferencia de despliegue',
    deploymentOptions: ['Nube', 'En sitio', 'No estoy seguro'],
    timelineLabel: 'Línea de Tiempo Deseada',
    timelineOptions: ['Lo antes posible', '1-3 meses', '3-6 meses', 'Flexible / Planificando'],
    budgetLabel: 'Presupuesto estimado (pago único)',
    budgetOptions: ['$120,000 – $240,000 MXN', '$240,000 – $500,000 MXN', '$500,000 – $1,000,000 MXN', '$1,000,000+ MXN', 'Aún no estoy seguro'],
    expectedGrowthLabel: 'Crecimiento de Negocio Esperado',
    growthOptions: ['Mantener operaciones actuales', 'Crecimiento moderado (10-25%)', 'Crecimiento significativo (25-50%)', 'Expansión rápida (50%+)'],
    partnershipGoalsLabel: '¿Qué esperas lograr con soporte continuo?',
    partnershipGoalsPlaceholder: 'ej., Optimización del sistema, desarrollo de nuevas funciones, soporte de escalamiento',
    errorTitle: 'Algo salió mal',
    errorBody: 'No pudimos enviar tu solicitud. Por favor intenta de nuevo o escríbenos directamente.',
    tryAgain: 'Intentar de Nuevo',
    invalidEmail: 'Por favor ingresa un correo electrónico válido',
    stillNeeded: 'Falta completar:',
  },
}

const dictionaries: Record<Language, Dict> = { en, es }

type LanguageContextValue = {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  t: Dict
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as Language | null
      if (stored === 'en' || stored === 'es') {
        setLanguageState(stored)
        return
      }
      const browser = window.navigator.language?.toLowerCase() ?? ''
      if (browser.startsWith('es')) setLanguageState('es')
    } catch {
      // ignore — SSR or storage unavailable
    }
  }, [])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language
    }
  }, [language])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    try {
      window.localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // ignore
    }
  }, [])

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'es' : 'en')
  }, [language, setLanguage])

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t: dictionaries[language],
    }),
    [language, setLanguage, toggleLanguage],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
