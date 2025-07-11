/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove dangerous ignores - we want to catch errors
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    domains: ['placeholder.com'],
  },
  experimental: {
    // typedRoutes: true, // Temporarily disabled for demo
    optimizePackageImports: ['lucide-react', '@radix-ui/react-*'],
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.klarna.com https://js.playground.klarna.com;",
              "style-src 'self' 'unsafe-inline';",
              "img-src 'self' data: https:;",
              "font-src 'self' data:;",
              "connect-src 'self' https://js.klarna.com https://na.playground.klarnaevt.com https://js.playground.klarna.com;",
              "frame-src https://js.klarna.com https://js.playground.klarna.com;",
            ].join(' '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
}

export default nextConfig
