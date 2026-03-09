/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },
  trailingSlash: true,
  async rewrites() {
    // In development, proxy /resume-game/* to the Vite dev server
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/resume-game/:path*',
          destination: 'http://localhost:5174/resume-game/:path*',
        },
      ];
    }
    return [];
  },
  transpilePackages: ['zustand', 'html-to-image'],
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    if (dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'named',
      };
    }
    
    return config;
  },
};

export default nextConfig; 