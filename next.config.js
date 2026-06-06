/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['ssh2', 'node-ssh'],
  images: {
    // SECURITY: Only allowlist hostnames you actually use.
    // A wildcard '**' turns Next.js into an open image proxy for the internet.
    // Add hostnames here as needed (e.g. your CDN, Supabase storage, Clerk avatars).
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',  // Clerk user avatars
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',  // Supabase Storage
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // If used for any UI imagery
      },
    ],
  },
}

module.exports = nextConfig
