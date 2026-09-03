/** @type {import('next').NextConfig} */
const BACKEND_ORIGIN =
  process.env.BACKEND_ORIGIN || "https://homatri-backend-195132182954.us-central1.run.app";

const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "commondatastorage.googleapis.com" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/homatri-api/:path*",
        destination: `${BACKEND_ORIGIN}/:path*`,
      },
    ];
  },
};

export default nextConfig;
