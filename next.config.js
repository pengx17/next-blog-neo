/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  serverExternalPackages: ["shiki"],
  basePath: process.env.BASE_PATH ?? "",
};

module.exports = nextConfig;
