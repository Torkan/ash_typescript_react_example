import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "node:path";
import { defineConfig } from "vite";
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
    plugins: [svelte()],
    resolve: {
      alias: {
        $lib: path.resolve(__dirname, "./js/lib"),
      },
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
    },
    server: {
      watch: {
        // Watch for new files in pages directory
        ignored: ["!**/js/pages/**/*.svelte"],
      },
    },
    build: {
      target: "esnext",
      emptyOutDir: true,
      polyfillDynamicImport: true,
      outDir: "../priv/ssr",
      sourcemap: isDev,
      manifest: "vite_manifest.json",
      ssr: true,
      watch: isDev
        ? {
            // Watch for new files in pages directory during development
            include: ["js/pages/**/*.svelte", "js/**/*.js", "js/**/*.ts"],
          }
        : undefined,
      rollupOptions: {
        input: "./js/ssr.js",
        output: {
          entryFileNames: outputFileNames,
          chunkFileNames: outputFileNames,
          assetFileNames: assetsOutputFileNames,
          format: "es",
        },
      },
    },
    ssr: {
      noExternal: true,
    },
  };
});
