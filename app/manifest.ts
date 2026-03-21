import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'youmatter Academy',
        short_name: 'youmatter',
        description: 'Premier English Learning Platform',
        start_url: '/',
        display: 'standalone',
        background_color: '#f5ebe3',
        theme_color: '#f5ebe3',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    };
}
