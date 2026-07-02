/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  webpack: (config: any) => {
    return config;
  },
};

export default nextConfig;
