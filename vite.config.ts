import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    "import.meta.env.VITE_USE_MOCKS": JSON.stringify(
      process.env.VITE_USE_MOCKS ?? "false",
    ),
  },
});
