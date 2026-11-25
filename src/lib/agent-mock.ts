import { simulateReadableStream } from "ai";
import { MockLanguageModelV4 } from "ai/test";

/**
 * Local-only scripted model (AGENT_MOCK=1) to exercise the agent UI without calling AI Gateway.
 * Never active in production unless that env var is set.
 */
type Chunk = Record<string, unknown>;
const usage = {
  inputTokens: { total: 1, noCache: 1, cacheRead: undefined, cacheWrite: undefined },
  outputTokens: { total: 1, text: 1, reasoning: undefined },
};
const text = (s: string): Chunk[] => [
  { type: "text-start", id: "t" },
  ...s.split(/(?<= )/).map((delta) => ({ type: "text-delta", id: "t", delta })),
  { type: "text-end", id: "t" },
];
const call = (toolName: string, input: unknown): Chunk => ({
  type: "tool-call",
  toolCallId: `c-${Math.random().toString(36).slice(2, 8)}`,
  toolName,
  input: JSON.stringify(input),
});
const finish = (tools: boolean): Chunk => ({ type: "finish", finishReason: { unified: tools ? "tool-calls" : "stop", raw: undefined }, usage });

export function mockAgentModel() {
  return new MockLanguageModelV4({
    doStream: async ({ prompt }) => {
      const last = prompt[prompt.length - 1] as { role: string; content: unknown };
      let chunks: Chunk[];
      if (last.role === "tool") {
        chunks = [...text("Pronto, destaquei no site. Quer que eu monte uma proposta para a sua empresa?"), finish(false)];
      } else {
        const content = last.content as { type: string; text?: string }[];
        const q = (Array.isArray(content) ? content.map((c) => c.text ?? "").join(" ") : String(content)).toLowerCase();
        if (q.includes("travar")) {
          chunks = [
            ...text("Vou montar a proposta."),
            { type: "tool-input-start", id: "x1", toolName: "showBrief" },
            { type: "tool-input-delta", id: "x1", delta: '{"title":"IA para' },
            { type: "finish", finishReason: { unified: "length", raw: undefined }, usage },
          ];
        } else if (q.includes("proposta")) {
          chunks = [
            ...text("Montei uma proposta preliminar com base no que você contou:"),
            call("showBrief", {
              title: "IA no atendimento de um e-commerce de moda",
              company: "Loja Exemplo",
              context: "E-commerce de moda com alto volume de atendimento no WhatsApp.",
              challenge: "Responder rápido dúvidas de pedido, troca e tamanho sem aumentar o time.",
              approach: ["Agente no WhatsApp com RAG sobre políticas e catálogo", "Integração com o status do pedido", "Passagem para humano em casos sensíveis", "Avaliação contínua de qualidade e custo"],
              offer: "production",
              steps: [
                { title: "Entender", text: "Mapear as 20 perguntas mais comuns e os dados disponíveis." },
                { title: "Piloto", text: "Agente em produção para um canal, com métricas." },
                { title: "Escalar", text: "Mais canais e automações, com o time interno." },
              ],
              relatedCase: "case-sales",
              nextStep: "Uma conversa de 30 minutos para validar escopo e dados.",
            }),
            finish(true),
          ];
        } else if (q.includes("post")) {
          chunks = [...text("Esse post fala de agentes com identidade própria e limite de gasto. Vou abrir para você."), call("openPost", { slug: "walmart-agent-gateway-agentes-com-limite-de-gasto" }), finish(true)];
        } else if (q.includes("agendar") || q.includes("reunião")) {
          chunks = [...text("Perfeito, abri a agenda do Rafael para você escolher um horário."), call("scheduleCall", { reason: "Agente de atendimento no WhatsApp" }), finish(true)];
        } else if (q.includes("contato") || q.includes("falar")) {
          chunks = [...text("Claro! Deixe seus dados que o Rafael fala com você."), call("requestContact", { reason: "Quer conversar sobre um agente de atendimento" }), finish(true)];
        } else if (q.includes("english") || q.includes("inglês")) {
          chunks = [call("setLocale", { locale: "en" }), finish(true)];
        } else {
          chunks = [
            ...text("O Rafael já colocou um **agente de vendas no WhatsApp** em produção. O pacote indicado é o **Do piloto à produção** (6–10 semanas)."),
            call("navigate", { target: "case-sales" }),
            finish(true),
          ];
        }
      }
      return { stream: simulateReadableStream({ chunks: chunks as never, chunkDelayInMs: 25 }) };
    },
  });
}
