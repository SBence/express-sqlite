import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      include: ["lib/src/**/*.ts"],
    },
  },
  plugins: [tsconfigPaths()],
});
