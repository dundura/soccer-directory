import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/shop", destination: "/gear", permanent: true },
      { source: "/shop/:slug", destination: "/gear/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
