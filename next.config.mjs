/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Bundle the logo with the contact API route so the PDF generator can read it
  // from disk at runtime on serverless (public/ assets aren't otherwise included).
  outputFileTracingIncludes: {
    '/api/contact': ['./public/logo_transparent_black.png'],
  },
}

export default nextConfig
