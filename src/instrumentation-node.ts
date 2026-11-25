/**
 * Sends AI SDK traces (site agent conversations, lead summaries) and funnel events to Langfuse.
 * Loaded only on the Node.js runtime and only when Langfuse keys are configured.
 */
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { LangfuseSpanProcessor } from "@langfuse/otel";
import { LangfuseVercelAiSdkIntegration } from "@langfuse/vercel-ai-sdk";
import { registerTelemetry } from "ai";

const processor = new LangfuseSpanProcessor({
  // keep Langfuse focused on AI + funnel spans, not every Next.js request
  shouldExportSpan: ({ otelSpan }) => otelSpan.instrumentationScope.name !== "next.js",
});
(globalThis as { __lfProcessor?: { forceFlush: () => Promise<void> } }).__lfProcessor = processor;

const provider = new NodeTracerProvider({ spanProcessors: [processor] });
provider.register();
registerTelemetry(new LangfuseVercelAiSdkIntegration());
