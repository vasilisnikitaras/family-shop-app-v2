/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // 🔥 FIX για το Vercel worker crash
  turbopack: {},

  webpack: (config: any) => {
    return config;
  },
};

export default nextConfig;
