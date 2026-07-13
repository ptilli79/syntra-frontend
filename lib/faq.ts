// Plain (server-safe) module so it can be imported by both the client i18n
// dictionary and the Server Component root layout (for FAQPage JSON-LD).
export type FaqItem = { q: string; a: string }

export const faqItemsEn: FaqItem[] = [
  {
    q: 'How do payments and billing work?',
    a: 'Subscription plans (Core and Pro) are billed monthly with a one-time setup fee at the start. Bespoke systems are quoted as a fixed project price and typically split into milestone-based payments. Final pricing is confirmed after your Strategy Session, once we understand your operations.',
  },
  {
    q: 'What is included in post-sales support?',
    a: 'Core and Pro plans include ongoing support as part of the subscription — email support on Core, priority support on Pro. Bespoke projects include a 60-day post-launch support window, with optional ongoing support and maintenance available afterward. Every engagement includes team training and documentation at handoff.',
  },
  {
    q: 'How do you handle updates and lifecycle management?',
    a: 'Subscription plans receive continuous improvements and platform updates while active. For bespoke systems, we design for longevity and offer optional maintenance to keep dependencies current, apply security patches, and expand the system as your business grows.',
  },
  {
    q: 'Who owns the system and the data?',
    a: 'Ownership depends on the engagement. With Core and Pro, Syntra owns and operates the platform while your business data always belongs to you — and you can export it at any time. With Bespoke systems, everything is yours: the platform and the source code. You also decide who handles ongoing maintenance — Syntra, your in-house engineering team, or a third party.',
  },
  {
    q: 'What do contract terms look like?',
    a: 'Subscriptions start with an initial term of 6 to 12 months, depending on the level of customization and any additional integrations required. After the initial term, plans renew in shorter three-month periods, so you keep flexibility without committing to another long block. Bespoke projects are governed by a scoped agreement that defines deliverables, milestones, and timelines. Specific terms are shared privately during scoping.',
  },
  {
    q: 'How long does implementation take?',
    a: 'Subscription plans can be provisioned quickly once your details are confirmed. Bespoke systems depend on scope — most projects run from a few weeks to a few months, following our Discovery → Design → Integration → Deployment process. We agree on a realistic timeline before work begins.',
  },
  {
    q: 'Can you integrate with the tools we already use?',
    a: 'Yes. A core part of what we do is connecting existing tools — spreadsheets, CRMs, messaging channels, and more — and building custom infrastructure only where real gaps exist. We map your current stack during Discovery.',
  },
  {
    q: 'How is our data kept secure?',
    a: 'Systems are built with encrypted daily backups, role-based access control, and HTTPS with authenticated sessions. Deployment can be cloud or on-premises depending on your needs. We discuss specific security requirements privately as part of scoping.',
  },
]

export const faqItemsEs: FaqItem[] = [
  {
    q: '¿Cómo funcionan los pagos y la facturación?',
    a: 'Los planes de suscripción (Core y Pro) se facturan mensualmente con una cuota única de implementación al inicio. Los sistemas a medida se cotizan como un precio fijo de proyecto, normalmente dividido en pagos por hitos. El precio final se confirma después de tu Sesión Estratégica, una vez que entendemos tus operaciones.',
  },
  {
    q: '¿Qué incluye el soporte post-venta?',
    a: 'Los planes Core y Pro incluyen soporte continuo como parte de la suscripción — soporte por correo en Core y soporte prioritario en Pro. Los proyectos a medida incluyen 60 días de soporte post-lanzamiento, con soporte y mantenimiento continuo opcional después. Cada proyecto incluye capacitación y documentación del equipo en el traspaso.',
  },
  {
    q: '¿Cómo manejan las actualizaciones y el ciclo de vida?',
    a: 'Los planes de suscripción reciben mejoras continuas y actualizaciones de la plataforma mientras están activos. Para los sistemas a medida diseñamos pensando en la longevidad y ofrecemos mantenimiento opcional para mantener las dependencias al día, aplicar parches de seguridad y expandir el sistema conforme crece tu negocio.',
  },
  {
    q: '¿Quién es dueño del sistema y de los datos?',
    a: 'La propiedad depende del tipo de proyecto. Con Core y Pro, Syntra es dueño y opera la plataforma, mientras que los datos de tu negocio siempre te pertenecen — y puedes exportarlos en cualquier momento. Con los sistemas a medida, todo es tuyo: la plataforma y el código fuente. Además, tú decides quién se encarga del mantenimiento continuo — Syntra, tu equipo de ingeniería interno o un tercero.',
  },
  {
    q: '¿Cómo son los términos del contrato?',
    a: 'Las suscripciones comienzan con un plazo inicial de 6 a 12 meses, según el nivel de personalización y las integraciones adicionales que se requieran. Después del plazo inicial, los planes se renuevan en periodos más cortos de tres meses, para que conserves flexibilidad sin comprometerte a otro bloque largo. Los proyectos a medida se rigen por un acuerdo con alcance definido que establece entregables, hitos y tiempos. Los términos específicos se comparten de forma privada durante la definición del alcance.',
  },
  {
    q: '¿Cuánto tarda la implementación?',
    a: 'Los planes de suscripción pueden aprovisionarse rápidamente una vez confirmados tus datos. Los sistemas a medida dependen del alcance — la mayoría de los proyectos van de unas semanas a unos meses, siguiendo nuestro proceso de Descubrimiento → Diseño → Integración → Despliegue. Acordamos un tiempo realista antes de empezar.',
  },
  {
    q: '¿Pueden integrarse con las herramientas que ya usamos?',
    a: 'Sí. Parte central de lo que hacemos es conectar las herramientas existentes — hojas de cálculo, CRMs, canales de mensajería y más — y construir infraestructura a medida solo donde hay brechas reales. Mapeamos tus sistemas actuales durante el Descubrimiento.',
  },
  {
    q: '¿Cómo se mantienen seguros nuestros datos?',
    a: 'Los sistemas se construyen con respaldos diarios cifrados, control de acceso basado en roles y HTTPS con sesiones autenticadas. El despliegue puede ser en la nube o en sitio según tus necesidades. Los requisitos de seguridad específicos se conversan de forma privada como parte de la definición del alcance.',
  },
]
