import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@school-portal/ui", "@school-portal/shared", "@school-portal/database"],
  env: {
    ADMIN_PORT: "3000",
  },
};

export default nextConfig;
