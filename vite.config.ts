import { existsSync, readdirSync, readFileSync } from "node:fs";
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

/** Puts each part's render and ports in dist/viessmann-boiler-card/, beside the card, for HACS to install. */
const bundleRenders: Plugin = {
  name: "bundle-renders",
  apply: "build",
  generateBundle() {
    for (const id of readdirSync("assets/renders")) {
      for (const file of ["render.webp", "ports.json"]) {
        const path = `assets/renders/${id}/${file}`;
        if (existsSync(path)) this.emitFile({ type: "asset", fileName: `viessmann-boiler-card/${id}/${file}`, source: readFileSync(path) });
      }
    }
  },
};

// `npm run dev` serves the dev page at /dev/ with renders from assets/ at /renders/.
// `npm run build` produces the single-file card bundle and its renders in dist/,
// which is committed because HACS installs from it.
export default defineConfig({
  plugins: [devPageRedirect, bundleRenders],
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
