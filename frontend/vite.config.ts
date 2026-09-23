/**
 * Configuracion de Vite.
 * - react(): soporte de React.
 * - VitePWA(): genera el manifest y usa src/sw.ts como service worker (para Web Push).
 * - server.proxy: redirige /api al backend (puerto 8000) para que el celular use una sola URL HTTPS.
 * - allowedHosts: true permite abrir la app desde el dominio del tunel (cloudflared/ngrok).
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      registerType: "autoUpdate",
      manifest: {
        name: "Lyra",
        short_name: "Lyra",
        description: "Tu compania en la cocina",
        lang: "es",
        display: "standalone",
        start_url: "/",
        background_color: "#ffffff",
        theme_color: "#b45309",
        icons: [
          { src: "/iconos/icono-192.png", sizes: "192x192", type: "image/png" },
          { src: "/iconos/icono-512.png", sizes: "512x512", type: "image/png" }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    allowedHosts: true,
    proxy: { "/api": "http://localhost:8000" }
  }
});
