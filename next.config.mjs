/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'potholedoctors.dev',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**'
      }
    ]
  },
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    'potholedoctor.test', // Add your dev domain(s) here
    '*.potholedoctor.test' // If you use subdomains
  ],
  compiler: {
    // Remove all console.* calls in production
    removeConsole: process.env.NODE_ENV === 'production'
  }
}

export default nextConfig
