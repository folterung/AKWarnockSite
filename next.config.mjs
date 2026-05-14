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
    if (process.env.NODE_ENV === 'development') {
      return [
        // Proxy /resume-game/* to the Vite dev server
        {
          source: '/resume-game/:path*',
          destination: 'http://localhost:5174/resume-game/:path*',
        },
        // Proxy /.netlify/functions/* to the Netlify dev server so the
        // ScratchyTD roadmap board works whether the user opens the app
        // on :3000 (next dev) or :8888 (netlify dev) under `npm run dev:netlify`.
        {
          source: '/.netlify/functions/:path*',
          destination: 'http://localhost:8888/.netlify/functions/:path*',
        },
      ];
    }
    return [];
  },
  transpilePackages: ['zustand', 'html-to-image', 'marked'],
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