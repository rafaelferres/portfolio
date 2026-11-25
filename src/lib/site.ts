export const site = {
  name: "Rafael Ferrés",
  email: "rafael@ferres.tech",
  linkedin: "https://www.linkedin.com/in/rafael-ferres",
  github: "https://github.com/rafaelferres",
  /** Cal.com event used by every "Book a call" button and by the site agent. */
  calLink: "rafael-ferres-seg2a5/30min",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ferres.tech").replace(/\/$/, ""),
  tools: ["OpenAI", "Anthropic", "Gemini", "Open Models", "LangChain", "LangGraph", "Agno", "Vercel AI SDK", "RAG", "Vector DB", "scikit-learn", "Langfuse", "AWS", "GCP", "Python", "FastAPI"],
};
