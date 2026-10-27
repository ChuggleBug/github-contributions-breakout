import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
    publicDir: false,
    build: {
        outDir: "dist-lib",
        emptyOutDir: false, // runs after build:lib, must not wipe it
        sourcemap: true,
        lib: {
            entry: resolve(__dirname, "lib/index.ts"),
            name: "Breakout",
            formats: ["iife"],
            fileName: () => "breakout.iife.js",
        },
    },
});
