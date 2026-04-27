import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静态导出 — Cloudflare Pages 只托管静态文件
  output: "export",
  // Velite uses a webpack plugin, so we need webpack mode
  turbopack: {},
  images: {
    unoptimized: true, // 静态导出不支持 Next.js Image Optimization
  },
  webpack: (config) => {
    config.plugins.push(new VeliteWebpackPlugin());
    return config;
  },
};

class VeliteWebpackPlugin {
  static started = false;
  apply(compiler: any) {
    compiler.hooks.beforeCompile.tapPromise("VeliteWebpackPlugin", async () => {
      if (VeliteWebpackPlugin.started) return;
      VeliteWebpackPlugin.started = true;
      const dev = compiler.options.mode === "development";
      const { build } = await import("velite");
      await build({ watch: dev, clean: !dev });
    });
  }
}

export default nextConfig;
