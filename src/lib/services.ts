import type { Locale } from "@/i18n/config";

/** Service landing pages (SEO). Facts only — no invented prices or results. */

export const SERVICE_IDS = ["assessment", "production", "advisory"] as const;
export type ServiceId = (typeof SERVICE_IDS)[number];

/** First path segment per locale: /pt/servicos/…, /en/services/…, /es/servicios/… */
export const SERVICE_SEGMENT: Record<Locale, string> = { pt: "servicos", en: "services", es: "servicios" };

export const SERVICE_SLUG: Record<ServiceId, Record<Locale, string>> = {
  assessment: { pt: "diagnostico-de-ia", en: "ai-assessment", es: "diagnostico-de-ia" },
  production: { pt: "ia-em-producao", en: "ai-in-production", es: "ia-en-produccion" },
  advisory: { pt: "advisory-de-ia", en: "ai-advisory", es: "advisory-de-ia" },
};

export const servicePath = (id: ServiceId, l: Locale) => `/${l}/${SERVICE_SEGMENT[l]}/${SERVICE_SLUG[id][l]}`;

export function serviceBySlug(l: Locale, slug: string): ServiceId | null {
  return SERVICE_IDS.find((id) => SERVICE_SLUG[id][l] === slug) ?? null;
}

type QA = { q: string; a: string };
export type ServiceContent = {
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  title: string;
  lead: string;
  duration: string;
  forWhoTitle: string;
  forWho: string[];
  getTitle: string;
  get: { title: string; text: string }[];
  stepsTitle: string;
  steps: { title: string; text: string }[];
  faq: QA[];
};

type Shared = {
  breadcrumb: string;
  proofTitle: string;
  proof: { value: string; label: string }[];
  faqTitle: string;
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
  otherTitle: string;
  learnMore: string;
};

export const SHARED: Record<Locale, Shared> = {
  pt: {
    breadcrumb: "Serviços",
    proofTitle: "Por que comigo",
    proof: [
      { value: "15+", label: "sistemas de IA em produção" },
      { value: "2023", label: "IA generativa em produto desde o início do ano" },
      { value: "8+", label: "projetos de IA liderados ao mesmo tempo hoje" },
      { value: "879M", label: "parâmetros no Krun One, meu modelo open source" },
    ],
    faqTitle: "Perguntas frequentes",
    ctaTitle: "Vamos falar sobre o seu projeto?",
    ctaText: "Uma conversa de 30 minutos, sem compromisso, para entender o seu contexto.",
    ctaButton: "Agendar conversa",
    otherTitle: "Outros serviços",
    learnMore: "Saiba mais",
  },
  en: {
    breadcrumb: "Services",
    proofTitle: "Why me",
    proof: [
      { value: "15+", label: "AI systems in production" },
      { value: "2023", label: "shipping generative AI since early that year" },
      { value: "8+", label: "AI projects led in parallel today" },
      { value: "879M", label: "parameters in Krun One, my open-source model" },
    ],
    faqTitle: "Frequently asked questions",
    ctaTitle: "Shall we talk about your project?",
    ctaText: "A 30-minute call, no commitment, to understand your context.",
    ctaButton: "Book a call",
    otherTitle: "Other services",
    learnMore: "Learn more",
  },
  es: {
    breadcrumb: "Servicios",
    proofTitle: "Por qué conmigo",
    proof: [
      { value: "15+", label: "sistemas de IA en producción" },
      { value: "2023", label: "IA generativa en producto desde inicios de ese año" },
      { value: "8+", label: "proyectos de IA liderados en paralelo hoy" },
      { value: "879M", label: "parámetros en Krun One, mi modelo open source" },
    ],
    faqTitle: "Preguntas frecuentes",
    ctaTitle: "¿Hablamos de tu proyecto?",
    ctaText: "Una conversación de 30 minutos, sin compromiso, para entender tu contexto.",
    ctaButton: "Agendar conversación",
    otherTitle: "Otros servicios",
    learnMore: "Ver más",
  },
};

/* FAQ entries that apply to every service */
export const COMMON_FAQ: Record<Locale, QA[]> = {
  pt: [
    { q: "Quanto custa?", a: "Depende do escopo. Depois de uma conversa de 30 minutos eu envio uma proposta com escopo, prazo e investimento fechados." },
    { q: "Vocês assinam NDA?", a: "Sim. Boa parte dos projetos que liderei é confidencial, e trabalho sob NDA sempre que o cliente precisa." },
    { q: "Quais modelos e nuvens vocês usam?", a: "Escolho pelo caso: OpenAI, Anthropic, Gemini ou modelos abertos, medindo qualidade e custo. Tenho projetos em produção na AWS e no GCP." },
    { q: "Atende empresas fora de São Paulo ou do Brasil?", a: "Sim. O trabalho é remoto, em português, inglês ou espanhol." },
  ],
  en: [
    { q: "How much does it cost?", a: "It depends on scope. After a 30-minute call I send a proposal with fixed scope, timeline and investment." },
    { q: "Do you sign NDAs?", a: "Yes. Much of the work I have led is confidential, and I work under NDA whenever the client needs it." },
    { q: "Which models and clouds do you use?", a: "I choose per use case: OpenAI, Anthropic, Gemini or open models, measuring quality and cost. I have systems in production on AWS and GCP." },
    { q: "Do you work with companies outside Brazil?", a: "Yes. Work is remote, in English, Portuguese or Spanish." },
  ],
  es: [
    { q: "¿Cuánto cuesta?", a: "Depende del alcance. Después de una conversación de 30 minutos envío una propuesta con alcance, plazo e inversión cerrados." },
    { q: "¿Firman NDA?", a: "Sí. Gran parte de los proyectos que lideré son confidenciales, y trabajo bajo NDA siempre que el cliente lo necesite." },
    { q: "¿Qué modelos y nubes usan?", a: "Elijo según el caso: OpenAI, Anthropic, Gemini o modelos abiertos, midiendo calidad y costo. Tengo sistemas en producción en AWS y GCP." },
    { q: "¿Trabajan con empresas fuera de Brasil?", a: "Sí. El trabajo es remoto, en español, inglés o portugués." },
  ],
};

const C: Record<ServiceId, Record<Locale, ServiceContent>> = {
  assessment: {
    pt: {
      metaTitle: "Diagnóstico de IA para empresas — Rafael Ferrés",
      metaDescription:
        "Descubra onde a IA gera retorno no seu negócio. Diagnóstico de 2 a 3 semanas com mapa de casos de uso, custo e retorno estimados e roadmap de 90 dias.",
      kicker: "S/01 · Diagnóstico de IA",
      title: "Descubra onde a IA gera retorno no seu negócio.",
      lead: "Em 2 a 3 semanas, mapeio processos, dados e metas da sua empresa e entrego um plano priorizado: o que fazer primeiro, quanto deve custar e que retorno esperar.",
      duration: "2–3 semanas",
      forWhoTitle: "Para quem é",
      forWho: [
        "Empresas que querem começar com IA, mas não sabem por onde.",
        "Times que já testaram IA e não viram resultado.",
        "Lideranças que precisam de um plano para aprovar orçamento.",
        "Empresas com muitas ideias e pouca clareza de prioridade.",
      ],
      getTitle: "O que você recebe",
      get: [
        { title: "Mapa de casos de uso", text: "As oportunidades de IA no seu negócio, com impacto, esforço e risco de cada uma." },
        { title: "Custo e retorno estimados", text: "Custo de construção e de operação por caso de uso, comparado ao ganho esperado." },
        { title: "Roadmap de 90 dias", text: "O que fazer primeiro, em que ordem, com quem e como medir." },
        { title: "Avaliação de dados e riscos", text: "Que dados existem, o que falta e os cuidados de segurança, privacidade e LGPD." },
      ],
      stepsTitle: "Como funciona",
      steps: [
        { title: "Entender", text: "Conversas com liderança e áreas para mapear processos, dados e metas." },
        { title: "Mapear", text: "Levantamento das oportunidades e dos dados disponíveis para cada uma." },
        { title: "Priorizar", text: "Estimativa de custo, retorno e risco para escolher por onde começar." },
        { title: "Entregar", text: "Apresentação do plano para a liderança, com roadmap e próximos passos." },
      ],
      faq: [
        { q: "O que acontece depois do diagnóstico?", a: "Você fica com o plano. Se quiser, o próximo passo natural é colocar o primeiro caso de uso em produção comigo, mas não é obrigatório." },
        { q: "Precisamos ter dados organizados?", a: "Não. Faz parte do diagnóstico avaliar que dados existem e o que precisa ser preparado." },
      ],
    },
    en: {
      metaTitle: "AI Assessment for companies — Rafael Ferrés",
      metaDescription:
        "Find where AI pays off in your business. A 2–3 week assessment with a use-case map, estimated cost and return, and a 90-day roadmap.",
      kicker: "S/01 · AI Assessment",
      title: "Find where AI pays off in your business.",
      lead: "In 2 to 3 weeks I map your processes, data and goals and deliver a prioritized plan: what to do first, what it should cost and what return to expect.",
      duration: "2–3 weeks",
      forWhoTitle: "Who it's for",
      forWho: [
        "Companies that want to start with AI but don't know where.",
        "Teams that tried AI and didn't see results.",
        "Leaders who need a plan to approve budget.",
        "Companies with many ideas and little clarity on priorities.",
      ],
      getTitle: "What you get",
      get: [
        { title: "Use-case map", text: "The AI opportunities in your business, with impact, effort and risk for each." },
        { title: "Estimated cost and return", text: "Build and run cost per use case, compared with the expected gain." },
        { title: "90-day roadmap", text: "What to do first, in which order, with whom and how to measure it." },
        { title: "Data and risk review", text: "What data exists, what is missing, and security, privacy and compliance concerns." },
      ],
      stepsTitle: "How it works",
      steps: [
        { title: "Understand", text: "Conversations with leadership and teams to map processes, data and goals." },
        { title: "Map", text: "Survey of opportunities and the data available for each." },
        { title: "Prioritize", text: "Cost, return and risk estimates to choose where to start." },
        { title: "Deliver", text: "Plan presented to leadership, with roadmap and next steps." },
      ],
      faq: [
        { q: "What happens after the assessment?", a: "You keep the plan. If you want, the natural next step is shipping the first use case to production with me, but it's optional." },
        { q: "Do we need organized data?", a: "No. Assessing what data exists and what needs preparing is part of the work." },
      ],
    },
    es: {
      metaTitle: "Diagnóstico de IA para empresas — Rafael Ferrés",
      metaDescription:
        "Descubre dónde la IA genera retorno en tu negocio. Diagnóstico de 2 a 3 semanas con mapa de casos de uso, costo y retorno estimados y roadmap de 90 días.",
      kicker: "S/01 · Diagnóstico de IA",
      title: "Descubre dónde la IA genera retorno en tu negocio.",
      lead: "En 2 a 3 semanas mapeo los procesos, datos y metas de tu empresa y entrego un plan priorizado: qué hacer primero, cuánto debería costar y qué retorno esperar.",
      duration: "2–3 semanas",
      forWhoTitle: "Para quién es",
      forWho: [
        "Empresas que quieren empezar con IA, pero no saben por dónde.",
        "Equipos que ya probaron IA y no vieron resultados.",
        "Líderes que necesitan un plan para aprobar presupuesto.",
        "Empresas con muchas ideas y poca claridad de prioridades.",
      ],
      getTitle: "Qué recibes",
      get: [
        { title: "Mapa de casos de uso", text: "Las oportunidades de IA en tu negocio, con impacto, esfuerzo y riesgo de cada una." },
        { title: "Costo y retorno estimados", text: "Costo de construcción y operación por caso de uso, comparado con la ganancia esperada." },
        { title: "Roadmap de 90 días", text: "Qué hacer primero, en qué orden, con quién y cómo medirlo." },
        { title: "Evaluación de datos y riesgos", text: "Qué datos existen, qué falta y los cuidados de seguridad y privacidad." },
      ],
      stepsTitle: "Cómo funciona",
      steps: [
        { title: "Entender", text: "Conversaciones con liderazgo y áreas para mapear procesos, datos y metas." },
        { title: "Mapear", text: "Relevamiento de oportunidades y de los datos disponibles para cada una." },
        { title: "Priorizar", text: "Estimación de costo, retorno y riesgo para elegir por dónde empezar." },
        { title: "Entregar", text: "Presentación del plan al liderazgo, con roadmap y próximos pasos." },
      ],
      faq: [
        { q: "¿Qué pasa después del diagnóstico?", a: "Te quedas con el plan. Si quieres, el siguiente paso natural es llevar el primer caso de uso a producción conmigo, pero es opcional." },
        { q: "¿Necesitamos datos organizados?", a: "No. Evaluar qué datos existen y qué hay que preparar es parte del diagnóstico." },
      ],
    },
  },
  production: {
    pt: {
      metaTitle: "IA em produção: do piloto ao sistema real — Rafael Ferrés",
      metaDescription:
        "Coloco agentes de IA, RAG e LLMs em produção em 6 a 10 semanas, com qualidade, custo e segurança medidos e passagem para o seu time.",
      kicker: "S/02 · Do piloto à produção",
      title: "Tire a IA do piloto e coloque em produção.",
      lead: "Em 6 a 10 semanas, construo um caso de uso de ponta a ponta, como um agente de atendimento, um RAG sobre documentos ou uma automação com LLM, e entrego funcionando, medido e documentado para o seu time.",
      duration: "6–10 semanas",
      forWhoTitle: "Para quem é",
      forWho: [
        "Empresas com um piloto de IA que nunca chegou à produção.",
        "Times que precisam de um agente ou RAG confiável, não de uma demo.",
        "Empresas preocupadas com custo, qualidade e segurança das respostas.",
        "Produtos que querem IA integrada a canais reais, como WhatsApp, site ou sistemas internos.",
      ],
      getTitle: "O que você recebe",
      get: [
        { title: "Agente ou RAG em produção", text: "O caso de uso rodando de verdade, integrado aos seus sistemas e canais." },
        { title: "Avaliação de qualidade", text: "Um conjunto de testes com perguntas reais para medir acerto antes e depois de cada mudança." },
        { title: "Observabilidade e custo", text: "Rastreamento de cada resposta, custo por tarefa e alertas, com ferramentas como Langfuse." },
        { title: "Passagem para o seu time", text: "Código, documentação e treinamento para o time evoluir o sistema sem depender de mim." },
      ],
      stepsTitle: "Como funciona",
      steps: [
        { title: "Desenhar", text: "Definição do caso de uso, da métrica de sucesso e da arquitetura." },
        { title: "Construir", text: "Desenvolvimento do agente ou RAG, com testes de qualidade desde o início." },
        { title: "Lançar", text: "Liberação gradual em produção, com monitoramento de qualidade e custo." },
        { title: "Passar o bastão", text: "Documentação, treinamento e ajustes finais com o seu time." },
      ],
      faq: [
        { q: "Que tipo de caso de uso vocês colocam em produção?", a: "Agentes de atendimento e vendas, RAG sobre documentos internos, geração de conteúdo e mídia, e sistemas que combinam agentes com machine learning clássico, como precificação." },
        { q: "E se não tivermos time técnico?", a: "Dá para operar o sistema com um time pequeno. A passagem inclui treinamento, e posso acompanhar depois pelo advisory mensal." },
      ],
    },
    en: {
      metaTitle: "AI in production: from pilot to real system — Rafael Ferrés",
      metaDescription:
        "I ship AI agents, RAG and LLM systems to production in 6–10 weeks, with measured quality, cost and safety, and a handover to your team.",
      kicker: "S/02 · Pilot to production",
      title: "Take AI out of the pilot and into production.",
      lead: "In 6 to 10 weeks I build one use case end to end, such as a customer-service agent, RAG over documents or an LLM automation, and deliver it running, measured and documented for your team.",
      duration: "6–10 weeks",
      forWhoTitle: "Who it's for",
      forWho: [
        "Companies with an AI pilot that never reached production.",
        "Teams that need a reliable agent or RAG, not a demo.",
        "Companies concerned about cost, quality and safety of answers.",
        "Products that want AI wired into real channels such as WhatsApp, web or internal systems.",
      ],
      getTitle: "What you get",
      get: [
        { title: "Agent or RAG in production", text: "The use case actually running, integrated with your systems and channels." },
        { title: "Quality evaluation", text: "A test set of real questions to measure accuracy before and after every change." },
        { title: "Observability and cost", text: "Tracing of every answer, cost per task and alerts, with tools such as Langfuse." },
        { title: "Handover to your team", text: "Code, documentation and training so your team can evolve the system without me." },
      ],
      stepsTitle: "How it works",
      steps: [
        { title: "Design", text: "Use case, success metric and architecture defined." },
        { title: "Build", text: "Agent or RAG built with quality tests from day one." },
        { title: "Launch", text: "Gradual production rollout, monitoring quality and cost." },
        { title: "Hand over", text: "Documentation, training and final adjustments with your team." },
      ],
      faq: [
        { q: "What kind of use cases do you ship?", a: "Customer-service and sales agents, RAG over internal documents, content and media generation, and systems combining agents with classic machine learning, such as pricing." },
        { q: "What if we don't have a technical team?", a: "A small team can run the system. The handover includes training, and I can stay on through the monthly advisory." },
      ],
    },
    es: {
      metaTitle: "IA en producción: del piloto al sistema real — Rafael Ferrés",
      metaDescription:
        "Llevo agentes de IA, RAG y LLMs a producción en 6 a 10 semanas, con calidad, costo y seguridad medidos y traspaso a tu equipo.",
      kicker: "S/02 · Del piloto a producción",
      title: "Saca la IA del piloto y llévala a producción.",
      lead: "En 6 a 10 semanas construyo un caso de uso de punta a punta, como un agente de atención, un RAG sobre documentos o una automatización con LLM, y lo entrego funcionando, medido y documentado para tu equipo.",
      duration: "6–10 semanas",
      forWhoTitle: "Para quién es",
      forWho: [
        "Empresas con un piloto de IA que nunca llegó a producción.",
        "Equipos que necesitan un agente o RAG confiable, no una demo.",
        "Empresas preocupadas por el costo, la calidad y la seguridad de las respuestas.",
        "Productos que quieren IA integrada a canales reales, como WhatsApp, sitio web o sistemas internos.",
      ],
      getTitle: "Qué recibes",
      get: [
        { title: "Agente o RAG en producción", text: "El caso de uso funcionando de verdad, integrado a tus sistemas y canales." },
        { title: "Evaluación de calidad", text: "Un conjunto de pruebas con preguntas reales para medir el acierto antes y después de cada cambio." },
        { title: "Observabilidad y costo", text: "Trazabilidad de cada respuesta, costo por tarea y alertas, con herramientas como Langfuse." },
        { title: "Traspaso a tu equipo", text: "Código, documentación y capacitación para que el equipo evolucione el sistema sin depender de mí." },
      ],
      stepsTitle: "Cómo funciona",
      steps: [
        { title: "Diseñar", text: "Definición del caso de uso, la métrica de éxito y la arquitectura." },
        { title: "Construir", text: "Desarrollo del agente o RAG, con pruebas de calidad desde el inicio." },
        { title: "Lanzar", text: "Liberación gradual en producción, monitoreando calidad y costo." },
        { title: "Traspasar", text: "Documentación, capacitación y ajustes finales con tu equipo." },
      ],
      faq: [
        { q: "¿Qué tipo de casos de uso llevan a producción?", a: "Agentes de atención y ventas, RAG sobre documentos internos, generación de contenido y medios, y sistemas que combinan agentes con machine learning clásico, como pricing." },
        { q: "¿Y si no tenemos equipo técnico?", a: "Un equipo pequeño puede operar el sistema. El traspaso incluye capacitación, y puedo acompañar después con el advisory mensual." },
      ],
    },
  },
  advisory: {
    pt: {
      metaTitle: "Advisory de IA mensal para lideranças — Rafael Ferrés",
      metaDescription:
        "Acompanhamento mensal de IA para liderança e time técnico: revisão de arquitetura, escolha de modelos, formação do time e apoio nas decisões.",
      kicker: "S/03 · Advisory de IA",
      title: "Um Head of AI ao lado da sua liderança, todo mês.",
      lead: "Para empresas que já têm (ou estão montando) um time de IA e querem alguém experiente para revisar decisões, evitar erros caros e acelerar o que já está em andamento.",
      duration: "Mensal",
      forWhoTitle: "Para quem é",
      forWho: [
        "Empresas montando um time de IA e sem liderança técnica na área.",
        "Times com vários projetos de IA e dúvidas de arquitetura e prioridade.",
        "Lideranças que precisam de uma segunda opinião antes de grandes decisões.",
        "Empresas que querem formar o time interno em IA aplicada.",
      ],
      getTitle: "O que você recebe",
      get: [
        { title: "Revisão de arquitetura", text: "Análise das soluções em andamento, com recomendações de qualidade, custo e segurança." },
        { title: "Escolha de modelos e fornecedores", text: "Que modelo, ferramenta ou fornecedor usar em cada caso, sem amarras comerciais." },
        { title: "Formação do time", text: "Mentoria e sessões práticas para o time ganhar autonomia em IA." },
        { title: "Apoio nas decisões", text: "Disponibilidade para as decisões importantes do mês, com a liderança e com o time." },
      ],
      stepsTitle: "Como funciona",
      steps: [
        { title: "Alinhar", text: "Entendimento dos projetos, do time e das metas para o período." },
        { title: "Acompanhar", text: "Encontros recorrentes com liderança e time técnico." },
        { title: "Revisar", text: "Revisão de arquitetura, código e métricas dos projetos de IA." },
        { title: "Evoluir", text: "Ajuste de prioridades e plano de formação a cada mês." },
      ],
      faq: [
        { q: "Qual o compromisso mínimo?", a: "Combinamos na proposta. O formato é mensal, para dar tempo de acompanhar a evolução dos projetos." },
        { q: "Vocês executam também ou só aconselham?", a: "No advisory, eu oriento e reviso. Se for preciso construir algo, dá para combinar com o serviço Do piloto à produção." },
      ],
    },
    en: {
      metaTitle: "Monthly AI advisory for leadership — Rafael Ferrés",
      metaDescription:
        "Monthly AI advisory for leadership and engineering: architecture reviews, model selection, team upskilling and support on key decisions.",
      kicker: "S/03 · AI Advisory",
      title: "A Head of AI beside your leadership, every month.",
      lead: "For companies that already have (or are building) an AI team and want an experienced partner to review decisions, avoid costly mistakes and speed up what is already in motion.",
      duration: "Monthly",
      forWhoTitle: "Who it's for",
      forWho: [
        "Companies building an AI team without technical AI leadership.",
        "Teams with several AI projects and open architecture and priority questions.",
        "Leaders who want a second opinion before big decisions.",
        "Companies that want to upskill their internal team in applied AI.",
      ],
      getTitle: "What you get",
      get: [
        { title: "Architecture reviews", text: "Analysis of solutions in progress, with recommendations on quality, cost and safety." },
        { title: "Model and vendor selection", text: "Which model, tool or vendor to use for each case, with no commercial ties." },
        { title: "Team upskilling", text: "Mentoring and hands-on sessions so the team becomes autonomous in AI." },
        { title: "Decision support", text: "Availability for the month's key decisions, with leadership and the team." },
      ],
      stepsTitle: "How it works",
      steps: [
        { title: "Align", text: "Understanding projects, team and goals for the period." },
        { title: "Accompany", text: "Recurring sessions with leadership and the technical team." },
        { title: "Review", text: "Architecture, code and metrics reviews of AI projects." },
        { title: "Evolve", text: "Priorities and upskilling plan adjusted every month." },
      ],
      faq: [
        { q: "Is there a minimum commitment?", a: "We agree on it in the proposal. The format is monthly, to allow time to follow how projects evolve." },
        { q: "Do you also build, or only advise?", a: "In advisory I guide and review. If something needs building, it can be combined with the Pilot to production service." },
      ],
    },
    es: {
      metaTitle: "Advisory de IA mensual para el liderazgo — Rafael Ferrés",
      metaDescription:
        "Acompañamiento mensual de IA para liderazgo y equipo técnico: revisión de arquitectura, elección de modelos, formación del equipo y apoyo en decisiones.",
      kicker: "S/03 · Advisory de IA",
      title: "Un Head of AI junto a tu liderazgo, cada mes.",
      lead: "Para empresas que ya tienen (o están armando) un equipo de IA y quieren a alguien con experiencia para revisar decisiones, evitar errores caros y acelerar lo que ya está en marcha.",
      duration: "Mensual",
      forWhoTitle: "Para quién es",
      forWho: [
        "Empresas armando un equipo de IA sin liderazgo técnico en el área.",
        "Equipos con varios proyectos de IA y dudas de arquitectura y prioridad.",
        "Líderes que necesitan una segunda opinión antes de grandes decisiones.",
        "Empresas que quieren formar al equipo interno en IA aplicada.",
      ],
      getTitle: "Qué recibes",
      get: [
        { title: "Revisión de arquitectura", text: "Análisis de las soluciones en curso, con recomendaciones de calidad, costo y seguridad." },
        { title: "Elección de modelos y proveedores", text: "Qué modelo, herramienta o proveedor usar en cada caso, sin ataduras comerciales." },
        { title: "Formación del equipo", text: "Mentoría y sesiones prácticas para que el equipo gane autonomía en IA." },
        { title: "Apoyo en decisiones", text: "Disponibilidad para las decisiones importantes del mes, con el liderazgo y el equipo." },
      ],
      stepsTitle: "Cómo funciona",
      steps: [
        { title: "Alinear", text: "Entendimiento de los proyectos, el equipo y las metas del período." },
        { title: "Acompañar", text: "Encuentros recurrentes con liderazgo y equipo técnico." },
        { title: "Revisar", text: "Revisión de arquitectura, código y métricas de los proyectos de IA." },
        { title: "Evolucionar", text: "Ajuste de prioridades y plan de formación cada mes." },
      ],
      faq: [
        { q: "¿Hay un compromiso mínimo?", a: "Lo acordamos en la propuesta. El formato es mensual, para dar tiempo a acompañar la evolución de los proyectos." },
        { q: "¿También ejecutan o solo aconsejan?", a: "En el advisory oriento y reviso. Si hace falta construir algo, se puede combinar con el servicio Del piloto a producción." },
      ],
    },
  },
};

export function getService(id: ServiceId, l: Locale): ServiceContent {
  const c = C[id][l];
  return { ...c, faq: [...c.faq, ...COMMON_FAQ[l]] };
}

/** Same page in another language, translating localized service paths (/pt/servicos/x ↔ /en/services/y). */
export function localizedPath(pathname: string, target: Locale): string {
  const parts = pathname.split("/");
  const from = parts[1] as Locale;
  if (parts[2] && SERVICE_SEGMENT[from] === parts[2] && parts[3]) {
    const id = serviceBySlug(from, parts[3]);
    if (id) return servicePath(id, target);
  }
  parts[1] = target;
  return parts.join("/") || `/${target}`;
}
