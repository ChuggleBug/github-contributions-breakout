import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
    base: "/app/gh-blocks",
    plugins: [
        react(),
        babel({ presets: [reactCompilerPreset()] }),
        tailwindcss(),
    ],
    build: { outDir: "dist-app" },
    resolve: {
        alias: { "@breakout": "../lib", "@breakout/react": "../lib/react" },
    },
});
