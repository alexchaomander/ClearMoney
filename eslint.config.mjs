import { fileURLToPath } from "node:url";
import path from "node:path";
import next from "@next/eslint-plugin-next";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = next.configs["core-web-vitals"];

export default [
  {
    ignores: ["dist/**", ".next/**", "node_modules/**", "legacy/**"],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      "@next/next": next,
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...nextConfig.rules,
      "@next/next/no-page-custom-font": "off",
    },
  },
];
