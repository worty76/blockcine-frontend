import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["example.com", "www.impawards.com"],
    // You can add more domains if needed:
    // domains: ['example.com', 'another-domain.com', 'one-more-domain.com'],

    // Alternatively, you can use remotePatterns for more granular control:
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'example.com',
    //     pathname: '/images/**',
    //   },
    // ],
  },
};

export default nextConfig;
