/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The site is published at https://nikosalonen.github.io/stick-picker/, and pages have
// real paths (/stick-picker/fi/opas/), so assets need an absolute base.
const base = "/stick-picker/";

export default defineConfig({
  base,
  plugins: [react()],
  // Vitest serves from "/", so tests get the real base path explicitly.
  test: { env: { BASE_URL: base } },
});
