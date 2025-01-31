import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"), // Define alias for src folder
        },
    },
    // server: {
    //   proxy: {
    //     "/api": {
    //       target: "http://localhost:5000", // Replace with your backend server URL
    //       changeOrigin: true, // Changes the origin of the request
    //       rewrite: (path) => path.replace(/^\/api/, ""), // Optional: Remove "/api" prefix
    //     },
    //   },
    // },
});
