/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔥 Απενεργοποιεί Turbopack πλήρως
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  webpack: (config) => {
    return config; // 🔥 Ενεργοποιεί Webpack mode
  },
};

export default nextConfig;
