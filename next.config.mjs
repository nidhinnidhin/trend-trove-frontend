// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   compiler: {
//     styledComponents: true,
//     emotion: true
//   },
//   transpilePackages: ['@mui/material', '@emotion/react', '@emotion/styled'],
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'www.coolibar.com',
//         pathname: '/cdn/shop/files/**',
//       },
//       {
//         protocol: 'https',
//         hostname: 'lh3.googleusercontent.com',
//       },
//       {
//         protocol: 'http',
//         hostname: '13.126.18.175',
//       },
//       {
//         protocol: 'https',
//         hostname: 'res.cloudinary.com',
//       },
//       {
//         protocol: 'https',
//         hostname: 'images.pexels.com',
//       }
//     ]
//   },
//   webpack: (config) => {
//     config.resolve.alias = {
//       ...config.resolve.alias,
//       '@emotion/core': '@emotion/react',
//       'emotion-theming': '@emotion/react',
//     };
//     return config;
//   }
// };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
    emotion: true
  },
  images: {
    domains: ['13.126.18.175'], // Add your EC2 instance IP
    unoptimized: true
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://13.126.18.175/api/:path*'
      }
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
