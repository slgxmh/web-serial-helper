import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: {
    resolve: true,
  },
  clean: true,
  minify: true,
  sourcemap: true,
  outDir: "dist",
  target: "es2020",
});
