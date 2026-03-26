import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // Dependencies:
    "node_modules/**",

    // Electron / installers:
    "electron/dist/**",
    "electron/out/**",
    "electron/build/**",

    // Misc:
    "coverage/**",

    // Large/binary assets (avoid accidental lint traversal)
    "**/*.exe",
    "**/*.msi",
  ]),
]);

export default eslintConfig;
