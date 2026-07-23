import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@school-portal/ui", "@school-portal/shared", "@school-portal/database"],
  env: {
    PARENT_PORT: "3001",
  },
};

export default nextConfig;
