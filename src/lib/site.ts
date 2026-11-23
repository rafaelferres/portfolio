export const site = {
  name: "Rafael Ferrés",
  email: "rafael@ferres.tech",
  linkedin: "https://www.linkedin.com/in/rafael-ferres",
  github: "https://github.com/rafaelferres",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://ferres.tech").replace(/\/$/, ""),
  tools: ["OpenAI", "Anthropic", "Gemini", "Open Models", "LangChain", "LangGraph", "Agno", "Vercel AI SDK", "RAG", "Vector DB", "scikit-learn", "Langfuse", "AWS", "GCP", "Python", "FastAPI"],
};
