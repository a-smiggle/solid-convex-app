import js from "@eslint/js";
import globals from "globals";
import solid from "eslint-plugin-solid";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["dist/**", "coverage/**", "node_modules/**", "convex/_generated/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ["src/**/*.tsx"],
    plugins: {
      solid,
    },
    rules: {
      ...solid.configs.recommended.rules,
      "solid/prefer-for": "off",
      "solid/reactivity": "off",
      "solid/components-return-once": "off",
    },
  },
  {
    files: ["convex/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["**/*.test.{ts,tsx}", "src/test/setup.ts"],
    languageOptions: {
      globals: {
        ...globals.vitest,
      },
    },
  },
];
