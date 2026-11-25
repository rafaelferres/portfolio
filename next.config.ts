import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // the site agent reads blog posts at request time
  outputFileTracingIncludes: { "/api/agent": ["./content/blog/**/*"] },
};

export default nextConfig;
