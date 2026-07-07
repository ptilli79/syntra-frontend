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
      sub: string
      desc: string
      features: string[]
      cta: string
    }>
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
      crm: string
      scheduling: string
      inventory: string
      accounting: string
      whatsapp: string
      none: string
    }
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
    eyebrow: 'Case Study',
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
        role: 'Co-Founder & Strategy Lead',
        location: 'United States',
        bio: 'Ana brings deep expertise in business operations and systems thinking to Syntra. With a background spanning operations strategy, client consulting, and process design, she translates business complexity into architectures that actually work. Bilingual and cross-cultural by nature, she ensures every system we build reflects the real texture of how teams and customers communicate.',
        tags: ['Operations Strategy', 'Client Consulting', 'Process Design', 'Bilingual'],
      },
      {
        name: 'Pierpaolo Tilli',
        role: 'Co-Founder & Systems Architect',
        location: 'Jersey City, NJ',
        bio: 'Pierpaolo brings two decades of telecommunications and systems architecture to Syntra. A PMP-certified engineer with experience across Venezuela, Mexico, and the United States, he has spent his career designing complex infrastructure for global carriers — and now applies that same precision to business operating systems. Fluent in AI agent architecture, AWS, and automation frameworks, he ensures every system we build is engineered to last.',
        tags: ['Systems Architecture', 'AI & Automation', 'Telecom Infrastructure', 'PMP Certified'],
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
        sub: 'First Engagement',
        desc: 'A focused 60-minute session to map your current operations, identify the highest-leverage gaps, and determine whether Syntra is the right fit.',
        features: [
          'Operations audit and gap analysis',
          'Current tools and workflow review',
          'Preliminary system architecture',
          'Fit assessment and next steps',
        ],
        cta: 'Book Your Session',
      },
      {
        name: 'System Design & Build',
        price: 'From $8,500 USD',
        sub: 'One-Time Project Fee',
        desc: 'A fully custom operating system designed, integrated, and deployed for your business. Scoped to your operations — no templates, no shortcuts.',
        features: [
          'Complete discovery and system mapping',
          'Custom platform architecture',
          'Tool integrations and automations',
          'AI assistant configuration',
          'Team training and documentation',
          '30-day post-launch support',
        ],
        cta: 'Start a Project',
      },
      {
        name: 'Ongoing Partnership',
        price: 'From $250 USD/mo',
        sub: 'Monthly Retainer',
        desc: 'Continuous system support, optimization, and expansion as your business evolves. Your operating system grows with you.',
        features: [
          'Dedicated system support',
          'Monthly optimization review',
          'New workflow and integration builds',
          'Priority response and implementation',
          'Quarterly strategy sessions',
        ],
        cta: 'Learn More',
      },
    ],
  },
  finalCta: {
    titleA: 'Your business already has the information.',
    titleB: 'It just needs a system.',
    body: "We'll map your current operations, identify every gap, and design the system that eliminates them.",
    cta: 'Schedule a Synthesis Session',
  },
  footer: {
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
      "Thanks for reaching out. We'll get back to you within one business day to schedule your session.",
    close: 'Close',
    // Multi-step form additions
    step1Title: 'Contact Info',
    step2Title: 'Business Details',
    step2Header: 'A few more details',
    step2Description: 'This helps us prepare for your session.',
    next: 'Continue',
    back: 'Back',
    sending: 'Sending...',
    selectOption: 'Select an option',
    industryLabel: 'Industry / Business Type',
    industryPlaceholder: 'e.g., Auto repair, Retail, Professional services',
    teamSizeLabel: 'Team Size',
    teamSizeOptions: ['Just me', '2-5 people', '6-15 people', '16-50 people', '50+ people'],
    mainChallengeLabel: 'What is your main operational challenge?',
    mainChallengePlaceholder: 'Describe the biggest friction point in your daily operations.',
    currentToolsLabel: 'What tools are you currently using?',
    toolOptions: {
      excel: 'Excel / Spreadsheets',
      crm: 'CRM Software',
      scheduling: 'Scheduling App',
      inventory: 'Inventory System',
      accounting: 'Accounting Software',
      whatsapp: 'WhatsApp Business',
      none: 'None / Manual only',
    },
    timelineLabel: 'Desired Timeline',
    timelineOptions: ['ASAP', '1-3 months', '3-6 months', 'Flexible / Planning ahead'],
    budgetLabel: 'Estimated Budget Range',
    budgetOptions: ['$8,500 - $15,000 USD', '$15,000 - $25,000 USD', '$25,000 - $50,000 USD', '$50,000+ USD', 'Not sure yet'],
    expectedGrowthLabel: 'Expected Business Growth',
    growthOptions: ['Maintaining current operations', 'Moderate growth (10-25%)', 'Significant growth (25-50%)', 'Rapid expansion (50%+)'],
    partnershipGoalsLabel: 'What do you hope to achieve with ongoing support?',
    partnershipGoalsPlaceholder: 'e.g., System optimization, new feature development, scaling support',
    errorTitle: 'Something went wrong',
    errorBody: 'We couldn\'t send your request. Please try again or email us directly.',
    tryAgain: 'Try Again',
    invalidEmail: 'Please enter a valid email address',
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
      { title: 'Diseño del Sistema', desc: 'Arquitectamos tu sistema operativo antes de escribir una sola línea de código.' },
      { title: 'Integración', desc: 'Conectamos las herramientas existentes y construimos infraestructura a medida donde hay brechas.' },
      { title: 'Despliegue', desc: 'Salimos a producción con tu equipo — incluye capacitación, documentación y un traspaso fluido.' },
      { title: 'Soporte y Optimización', desc: 'Soporte continuo, mejora constante y expansión del sistema conforme tu negocio crece.' },
    ],
  },
  caseStudy: {
    eyebrow: 'Caso de Estudio',
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
        role: 'Cofundadora y Líder de Estrategia',
        location: 'Estados Unidos',
        bio: 'Ana aporta a Syntra una profunda experiencia en operaciones de negocio y pensamiento sistémico. Con un trayecto que abarca estrategia de operaciones, consultoría a clientes y diseño de procesos, traduce la complejidad del negocio en arquitecturas que realmente funcionan. Bilingüe e intercultural por naturaleza, se asegura de que cada sistema que construimos refleje la textura real de cómo se comunican los equipos y los clientes.',
        tags: ['Estrategia de Operaciones', 'Consultoría a Clientes', 'Diseño de Procesos', 'Bilingüe'],
      },
      {
        name: 'Pierpaolo Tilli',
        role: 'Cofundador y Arquitecto de Sistemas',
        location: 'Jersey City, NJ',
        bio: 'Pierpaolo aporta dos décadas de telecomunicaciones y arquitectura de sistemas a Syntra. Ingeniero certificado PMP con experiencia en Venezuela, México y Estados Unidos, ha dedicado su carrera a diseñar infraestructura compleja para operadores globales — y ahora aplica esa misma precisión a sistemas operativos de negocio. Con dominio en arquitectura de agentes de IA, AWS y frameworks de automatización, garantiza que cada sistema que construimos esté diseñado para durar.',
        tags: ['Arquitectura de Sistemas', 'IA y Automatización', 'Infraestructura Telecom', 'Certificación PMP'],
      },
    ],
    linkedinAria: (name) => `${name} en LinkedIn`,
    portraitAlt: (name) => `Retrato de ${name}`,
  },
  pricing: {
    eyebrow: 'Estructura de Tarifas',
    title: 'Precios transparentes, por proyecto.',
    body: 'Cada engagement se ajusta a tus operaciones. Sin suscripciones a software que no usarás — solo el sistema que tu negocio realmente necesita.',
    mostCommon: 'Más Común',
    footnote:
      'Todos los proyectos comienzan con una Sesión Estratégica de cortesía. El precio final se determina después del scoping — cada negocio es diferente.',
    tiers: [
      {
        name: 'Sesión Estratégica',
        price: 'De Cortesía',
        sub: 'Primer Contacto',
        desc: 'Una sesión enfocada de 60 minutos para mapear tus operaciones actuales, identificar las brechas de mayor impacto y determinar si Syntra es la opción correcta.',
        features: [
          'Auditoría de operaciones y análisis de brechas',
          'Revisión de herramientas y flujos actuales',
          'Arquitectura preliminar del sistema',
          'Evaluación de encaje y próximos pasos',
        ],
        cta: 'Agenda tu Sesión',
      },
      {
        name: 'Diseño y Construcción del Sistema',
        price: 'Desde $150,000 MXN',
        sub: 'Tarifa Única de Proyecto',
        desc: 'Un sistema operativo totalmente a medida, diseñado, integrado y desplegado para tu negocio. Ajustado a tus operaciones — sin plantillas, sin atajos.',
        features: [
          'Descubrimiento completo y mapeo del sistema',
          'Arquitectura de plataforma a medida',
          'Integraciones y automatizaciones',
          'Configuración de asistente de IA',
          'Capacitación y documentación del equipo',
          'Soporte post-lanzamiento por 30 días',
        ],
        cta: 'Iniciar un Proyecto',
      },
      {
        name: 'Alianza Continua',
        price: 'Desde $4,500 MXN/mes',
        sub: 'Retainer Mensual',
        desc: 'Soporte continuo, optimización y expansión del sistema conforme tu negocio evoluciona. Tu sistema operativo crece contigo.',
        features: [
          'Soporte dedicado del sistema',
          'Revisión mensual de optimización',
          'Construcción de nuevos flujos e integraciones',
          'Respuesta e implementación prioritaria',
          'Sesiones estratégicas trimestrales',
        ],
        cta: 'Más Información',
      },
    ],
  },
  finalCta: {
    titleA: 'Tu negocio ya tiene la información.',
    titleB: 'Solo le falta un sistema.',
    body: 'Mapearemos tus operaciones actuales, identificaremos cada brecha y diseñaremos el sistema que las elimina.',
    cta: 'Agenda una Sesión de Síntesis',
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
      'Gracias por contactarnos. Te responderemos en un día hábil para agendar tu sesión.',
    close: 'Cerrar',
    // Multi-step form additions
    step1Title: 'Datos de Contacto',
    step2Title: 'Detalles del Negocio',
    step2Header: 'Algunos detalles más',
    step2Description: 'Esto nos ayuda a prepararnos para tu sesión.',
    next: 'Continuar',
    back: 'Atrás',
    sending: 'Enviando...',
    selectOption: 'Selecciona una opción',
    industryLabel: 'Industria / Tipo de Negocio',
    industryPlaceholder: 'ej., Taller mecánico, Retail, Servicios profesionales',
    teamSizeLabel: 'Tamaño del Equipo',
    teamSizeOptions: ['Solo yo', '2-5 personas', '6-15 personas', '16-50 personas', '50+ personas'],
    mainChallengeLabel: '¿Cuál es tu principal reto operativo?',
    mainChallengePlaceholder: 'Describe el mayor punto de fricción en tus operaciones diarias.',
    currentToolsLabel: '¿Qué herramientas usas actualmente?',
    toolOptions: {
      excel: 'Excel / Hojas de cálculo',
      crm: 'Software de CRM',
      scheduling: 'App de Agenda',
      inventory: 'Sistema de Inventario',
      accounting: 'Software de Contabilidad',
      whatsapp: 'WhatsApp Business',
      none: 'Ninguna / Solo manual',
    },
    timelineLabel: 'Línea de Tiempo Deseada',
    timelineOptions: ['Lo antes posible', '1-3 meses', '3-6 meses', 'Flexible / Planificando'],
    budgetLabel: 'Rango de Presupuesto Estimado',
    budgetOptions: ['$150,000 - $275,000 MXN', '$275,000 - $450,000 MXN', '$450,000 - $900,000 MXN', '$900,000+ MXN', 'Aún no estoy seguro'],
    expectedGrowthLabel: 'Crecimiento de Negocio Esperado',
    growthOptions: ['Mantener operaciones actuales', 'Crecimiento moderado (10-25%)', 'Crecimiento significativo (25-50%)', 'Expansión rápida (50%+)'],
    partnershipGoalsLabel: '¿Qué esperas lograr con soporte continuo?',
    partnershipGoalsPlaceholder: 'ej., Optimización del sistema, desarrollo de nuevas funciones, soporte de escalamiento',
    errorTitle: 'Algo salió mal',
    errorBody: 'No pudimos enviar tu solicitud. Por favor intenta de nuevo o escríbenos directamente.',
    tryAgain: 'Intentar de Nuevo',
    invalidEmail: 'Por favor ingresa un correo electrónico válido',
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
