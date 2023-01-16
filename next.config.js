/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  experimental: {
    // https://beta.nextjs.org/docs/upgrade-guide#step-1-creating-the-app-directory
    appDir: true,
  },
  basePath: process.env.BASE_PATH ?? "",
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
