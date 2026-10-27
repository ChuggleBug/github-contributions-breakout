import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { resolve } from "node:path";

export default defineConfig({
    plugins: [
        react(),
        dts({ tsconfigPath: "./tsconfig.lib.json", include: ["lib"] }),
    ],
    publicDir: false, // stops favicon.svg leaking into the package
    build: {
        outDir: "dist-lib",
        emptyOutDir: true,
        sourcemap: true,
        lib: {
            entry: {
                breakout: resolve(__dirname, "lib/index.ts"),
                react: resolve(__dirname, "lib/react.ts"),
            },
            formats: ["es", "cjs"],
            fileName: (format, entryName) =>
                `${entryName}.${format === "es" ? "js" : "cjs"}`,
        },
        rolldownOptions: {
            external: [/^react(\/.*)?$/, /^react-dom(\/.*)?$/],
        },
    },
});
