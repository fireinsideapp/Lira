// Vite: React + Tailwind + PWA (service worker propio en src/sw.ts).
// El proxy manda /api al backend (puerto 8000) para que el celular use una sola URL HTTPS.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

const servidor = {
  host: true,
  allowedHosts: true as const, // permite abrir la app desde el dominio del tunel
  proxy: { "/api": "http://localhost:8000" },
};

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      registerType: "autoUpdate",
      manifest: {
        name: "Lyra",
        short_name: "Lyra",
        description: "Tu compañía en la cocina",
        lang: "es",
        display: "standalone",
        start_url: "/",
        background_color: "#ffffff",
        theme_color: "#2563eb",
        icons: [
          { src: "/iconos/icono-192.png", sizes: "192x192", type: "image/png" },
          { src: "/iconos/icono-512.png", sizes: "512x512", type: "image/png" },
          { src: "/iconos/icono-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
  server: { port: 5173, ...servidor },
  preview: { port: 4173, ...servidor },
});
