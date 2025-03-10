/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true, 
    emotion: true, 
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.coolibar.com',
        pathname: '/cdn/shop/files/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      }
    ]
  },

};

export default nextConfig;
