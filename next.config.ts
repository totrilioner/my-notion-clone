import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable gzip compression for all responses
  compress: true,
  
  // Optimize package imports to reduce bundle size
  experimental: {
    optimizePackageImports: ["recharts", "@supabase/supabase-js"],
  },
  
  // Image optimization
  images: {
    formats: ["image/webp", "image/avif"],
  },
  
  // Allow access from local network IP for testing
  allowedDevOrigins: ["192.168.1.67"],
};

export default nextConfig;
