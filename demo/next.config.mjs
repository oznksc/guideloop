import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  /**
   * Production builds must never ship the visual Tour Builder.
   * Alias the real package entry to a no-op so even residual client
   * references collapse to an empty component.
   */
  webpack: (config, { dev }) => {
    if (!dev) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@guideloop/react/builder": path.resolve(
          __dirname,
          "src/shims/empty-builder.tsx"
        ),
      };
    }
    return config;
  },
};

export default nextConfig;
