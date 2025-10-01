import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Remove the webpack configuration that was causing issues
  // webpack: (config, { dev }) => {
  //   if (dev) {
  //     // Disable webpack's hot module replacement
  //     config.watchOptions = {
  //       ignored: ['**/*'], // This was causing the issue
  //     };
  //   }
  //   return config;
  // },
  eslint: {
    // Build with ignoring ESLint errors
    ignoreDuringBuilds: true,
  },
  // Add allowed dev origins for cross-origin requests
  allowedDevOrigins: [
    'preview-chat-8baf56d2-7ec5-4d16-ada2-a8c3386b20a7.space.z.ai',
    'localhost:3000',
    '0.0.0.0:3000'
  ],
};

export default nextConfig;
