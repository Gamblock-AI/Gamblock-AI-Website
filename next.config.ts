import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output: Next.js produces a self-contained server bundle under
  // .next/standalone that the Docker image copies into a minimal runtime. This
  // keeps the image small (no node_modules at runtime).
  output: "standalone",
};

export default nextConfig;
