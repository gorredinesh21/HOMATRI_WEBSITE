/** @type {import('next').NextConfig} */
const nextConfig = {
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
        destination: "https://homatri-backend-195132182954.us-central1.run.app/:path*",
      },
    ];
  },
};

export default nextConfig;
