import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/shop/:slug", destination: "/gear/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
