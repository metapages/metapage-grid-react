import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';

// Get the github pages path e.g. if served from https://<name>.github.io/<repo>/
// then we need to pull out "<repo>"
const packageName = JSON.parse(
  fs.readFileSync("./package.json", { encoding: "utf8", flag: "r" })
)["name"];

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  resolve: {
    alias: {
      "/@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/lib/index.ts'),
      name: packageName,
      fileName: (format) => {
        return `index.${format}.${format === "umd" ? "cjs" : "js"}`;
      }
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["react"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          react: "React"
        }
      }
    },
    sourcemap: true,
    minify: mode === "development" ? false : "esbuild",
    emptyOutDir: false,
    target: 'modules',
  },
}));
