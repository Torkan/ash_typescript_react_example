import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import type { ConfigEnv } from "vite";

export default defineConfig(({ mode }: ConfigEnv) => {
  const isDev = mode === "development";

  let outputFileNames = "assets/[name].[hash].js";
  let assetsOutputFileNames = "assets/[name].[hash][extname]";

  if (isDev) {
    outputFileNames = "assets/[name].js";
    assetsOutputFileNames = "assets/[name][extname]";
  }

  return {
    publicDir: "static",
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        $lib: path.resolve(__dirname, "./js/lib"),
      },
    },
    server: {
      watch: {
        // Watch for changes in Phoenix files
        ignored: [
          "!../lib/ash_typescript_react_example_web/**/*.ex",
          "!**/js/pages/**/*.tsx",
          "!**/js/pages/**/*.jsx",
        ],
      },
      // Port for Vite dev server
      port: 5173,
      strictPort: true,
      // Enable HMR
      hmr: {
        port: 5173,
        host: "localhost",
      },
      // Proxy API requests to Phoenix server
      proxy: {
        "/phoenix/live_reload/socket": {
          target: "ws://localhost:4000",
          ws: true, // Enable WebSocket proxying
          changeOrigin: true,
          secure: false,
        },
        // Proxy all non-asset requests to Phoenix
        "^(?!(/js/|/css/|/@vite/|/@vitejs/|/@fs/|/@id/|/@react-refresh|/node_modules/)).*":
          {
            target: "http://localhost:4000",
            changeOrigin: true,
            secure: false,
          },
      },
    },
    build: {
      target: "esnext",
      emptyOutDir: true,
      polyfillDynamicImport: true,
      outDir: "../priv/static",
      sourcemap: isDev,
      manifest: "vite_manifest.json",
      watch: isDev
        ? {
            // Watch for new files in pages directory during development
            include: [
              "js/pages/**/*.tsx",
              "js/pages/**/*.jsx",
              "js/**/*.js",
              "js/**/*.ts",
              "js/**/*.tsx",
              "css/**/*",
            ],
          }
        : undefined,
      rollupOptions: {
        input: {
          app: "./js/app.tsx",
          styles: "./css/app.css",
        },
        output: {
          entryFileNames: outputFileNames,
          chunkFileNames: outputFileNames,
          assetFileNames: assetsOutputFileNames,
        },
        external: ["/fonts/*", "/images/*"],
      },
    },

    define: {
      global: "globalThis",
    },
  };
});
