// next.config.ts

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.pexels.com',
            },
            // Add more remote patterns here if needed
        ],
    },
};

export default nextConfig;