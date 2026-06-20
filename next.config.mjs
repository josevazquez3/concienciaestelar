/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "pdf-parse",
      "@prisma/client",
      "bcryptjs",
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
      },
    ],
  },
};

export default nextConfig;
