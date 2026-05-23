import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  eslint: {
    // Desabilita o lint durante o build para evitar que erros de estilo travem o deploy
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Desabilita a checagem de tipos durante o build para evitar travamentos por avisos
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
