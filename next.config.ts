import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/shop/:slug", destination: "/gear/:slug", permanent: true },
      { source: "/services/soccer-dad", destination: "/books-and-authors/soccer-dad", permanent: true },
    ];
  },
};

export default nextConfig;
