/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { APP_NAME, THEME_COLOR } from "./src/app/constants";

function injectAppName(): Plugin {
  return {
    name: "inject-app-name",
    transformIndexHtml: (html) => html.replaceAll("__APP_NAME__", APP_NAME),
  };
}

export default defineConfig({
  plugins: [
    react(),
    injectAppName(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: APP_NAME,
        short_name: APP_NAME,
        description: "Pass-the-phone party games",
        display: "standalone",
        orientation: "portrait",
        start_url: "./",
        scope: "./",
        background_color: THEME_COLOR,
        theme_color: THEME_COLOR,
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,webmanifest}"],
        navigateFallback: "index.html",
      },
    }),
  ],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // The module cache keeps stale import.meta.glob results, so new pack files would go unvalidated.
    fsModuleCache: false,
  },
});
