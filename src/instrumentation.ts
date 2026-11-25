/** Next.js startup hook. Node-only tracing setup lives in instrumentation-node.ts. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (!process.env.LANGFUSE_PUBLIC_KEY || !process.env.LANGFUSE_SECRET_KEY) return;
  await import("./instrumentation-node");
}
