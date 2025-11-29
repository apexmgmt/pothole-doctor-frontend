/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'potholedoctors.dev',
                port: '',
                pathname: '/**',
            },
        ],
    },
};

export default nextConfig;
