import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tailwind from "eslint-plugin-tailwindcss";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...tailwind.configs["flat/recommended"],
  {
    rules: {
      // eslint-plugin-tailwindcss v3 cannot parse Tailwind v4 CSS-first
      // @theme tokens and repeatedly scans them for every source file.
      // Tailwind v4 and prettier-plugin-tailwindcss remain responsible for
      // utility generation and class ordering.
      'tailwindcss/classnames-order': 'off',
      'tailwindcss/enforces-negative-arbitrary-values': 'off',
      'tailwindcss/enforces-shorthand': 'off',
      'tailwindcss/no-custom-classname': 'off',
      'tailwindcss/no-unnecessary-arbitrary-value': 'off',
    },
    settings: {
      tailwindcss: {
        config: {},
      },
    },
  },
  {
    files: ["fix-messages.js", "scripts/download-placeholders.js"],
    rules: {
      // These local maintenance scripts intentionally use CommonJS because the
      // package is not an ESM package.
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
