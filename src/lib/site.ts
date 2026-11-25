export const site = {
  name: "Rafael Ferrés",
  email: "rafael@ferres.tech",
  linkedin: "https://www.linkedin.com/in/rafael-ferres",
  github: "https://github.com/rafaelferres",
  /** WhatsApp (wa.me needs digits only: country + area + number). */
  whatsapp: "5511919176981",
  /** Cal.com event used by every "Book a call" button and by the site agent. */
  calLink: "rafael-ferres-seg2a5/30min",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ferres.tech").replace(/\/$/, ""),
  tools: ["OpenAI", "Anthropic", "Gemini", "Open Models", "LangChain", "LangGraph", "Agno", "Vercel AI SDK", "RAG", "Vector DB", "scikit-learn", "Langfuse", "AWS", "GCP", "Python", "FastAPI"],
};

const WA_TEXT: Record<string, string> = {
  pt: "Olá, Rafael! Vim pelo site ferres.tech e quero conversar sobre IA na minha empresa.",
  en: "Hi Rafael! I found you on ferres.tech and would like to talk about AI at my company.",
  es: "¡Hola, Rafael! Vengo del sitio ferres.tech y quiero hablar sobre IA en mi empresa.",
};

/** wa.me link with a prefilled message in the visitor's language. */
export const whatsappUrl = (locale: string) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(WA_TEXT[locale] ?? WA_TEXT.pt)}`;
