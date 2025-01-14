import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import unpluginIcons from "unplugin-icons/webpack";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  webpack(config) {
    config.plugins.push(
      unpluginIcons({
        compiler: "jsx",
        jsx: "react",
      })
    );
    return config;
  },
};

const withMDX = createMDX();

export default withMDX(nextConfig);
