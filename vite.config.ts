import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

/** Sends the dev server's root URL to the dev page. */
const devPageRedirect: Plugin = {
  name: "dev-page-redirect",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const { url } = req as { url?: string };
      if (url !== "/" && url !== "/index.html") return next();
      res.statusCode = 302;
      res.setHeader("Location", "/dev/");
      res.end();
    });
  },
};

// `npm run dev` serves the dev page at /dev/ with renders from assets/ at /renders/.
// `npm run build` produces the single-file card bundle for Home Assistant.
export default defineConfig({
  plugins: [devPageRedirect],
  publicDir: "assets",
  server: { port: 5178 },
  build: {
    outDir: "dist",
    copyPublicDir: false,
    target: "es2022",
    sourcemap: true,
    lib: {
      entry: "src/viessmann-boiler-card.ts",
      formats: ["es"],
      fileName: () => "viessmann-boiler-card.js",
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
