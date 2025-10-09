import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Path aliases para imports limpios
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/shared": path.resolve(__dirname, "./src/shared"),
      "@/features": path.resolve(__dirname, "./src/features"),
      "@/layouts": path.resolve(__dirname, "./src/layouts"),
      "@/pages": path.resolve(__dirname, "./src/pages"),
      "@/assets": path.resolve(__dirname, "./src/assets"),
    },
  },

  // Configuración del servidor de desarrollo
  server: {
    port: 5173,
    host: true, // Permite acceso desde red local (importante para PWA testing)

    // Proxy para desarrollo - evita CORS con el backend
    proxy: {
      "/api": {
        target: "http://localhost:3000", // URL del backend Fastify
        changeOrigin: true,
        secure: false,
        // No reescribimos la ruta porque el backend espera /api
      },
    },
  },

  // Optimizaciones de build
  build: {
    target: "esnext",
    sourcemap: false, // Desactivar en producción por seguridad
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendor chunks para mejor caching
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "form-vendor": ["react-hook-form", "@hookform/resolvers", "zod"],
          "utils-vendor": ["axios", "zustand", "date-fns"],
        },
      },
    },
  },

  // Optimización de dependencias
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
  },
});
