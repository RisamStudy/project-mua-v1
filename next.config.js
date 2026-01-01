/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output
  // output: 'standalone',

  // Disable x-powered-by header
  poweredByHeader: false,

  // Production optimizations
  compress: true,
  reactStrictMode: true,

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { 
            key: 'Strict-Transport-Security', 
            value: 'max-age=31536000; includeSubDomains; preload' 
          },
          { 
            key: 'Content-Security-Policy', 
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com data:; img-src 'self' data: blob: https:; connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; frame-ancestors 'self';" 
          },
          { 
            key: 'Permissions-Policy', 
            value: 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=()' 
          },
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
