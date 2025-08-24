import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import type { ConfigEnv } from "vite";

export default defineConfig(({ mode }: ConfigEnv) => {
  const isDev = mode === "development";

  if (isDev) {
    // Terminate the watcher when Phoenix quits
    process.stdin.on("close", () => {
      process.exit(0);
    });

    process.stdin.resume();
  }

  // Set NODE_ENV for the SSR bundle
  process.env.NODE_ENV = mode;

  let outputFileNames = "[name].[hash].js";
  let assetsOutputFileNames = "[name].[hash][extname]";

  if (isDev) {
    outputFileNames = "[name].js";
    assetsOutputFileNames = "[name].[extname]";
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
    },
    build: {
      target: "esnext",
      emptyOutDir: true,
      outDir: "../priv/ssr",
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
        input: "./js/ssr.tsx",
        output: {
          entryFileNames: outputFileNames,
          chunkFileNames: outputFileNames,
          assetFileNames: assetsOutputFileNames,
          format: "es" as const,
        },
      },
    },
    ssr: {
      noExternal: true as true,
      target: "node" as const,
    },
    define: {
      global: "globalThis",
      "process.env.NODE_ENV": JSON.stringify(mode),
    },
  };
});
