/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  experimental: {
    // https://beta.nextjs.org/docs/upgrade-guide#step-1-creating-the-app-directory
    appDir: true,
    // see https://github.com/shikijs/next-shiki
    serverComponentsExternalPackages: ["shiki", "vscode-oniguruma"],
  },
  basePath: process.env.BASE_PATH ?? "",
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
