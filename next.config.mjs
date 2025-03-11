// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   compiler: {
//     styledComponents: true,
//     emotion: true
//   },
//   images: {
//     domains: ['13.126.18.175'],
//     unoptimized: true
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
    domains: ['www.trendrove.shop', 'res.cloudinary.com'],
    unoptimized: true
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@emotion/core': '@emotion/react',
      'emotion-theming': '@emotion/react',
    };
    return config;
  },
  // Add this section for API requests
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://www.trendrove.shop/api/:path*',
      },
    ];
  },
  // Configure CORS to allow credentials and handle mixed content
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: 'https://www.trendrove.shop' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  }
};

export default nextConfig;