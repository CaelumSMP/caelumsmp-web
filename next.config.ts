import { readFileSync } from "node:fs";
import type { NextConfig } from "next";

// The version shown in the corner badge. Read from package.json at build time
// rather than process.env.npm_package_version, which only exists when the build
// is run through an npm script.
const { version } = JSON.parse(readFileSync("./package.json", "utf8"));

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
  },
};

export default nextConfig;
