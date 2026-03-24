const nextCoreWebVitals = require("eslint-config-next/core-web-vitals");
const nextTypescript = require("eslint-config-next/typescript");

module.exports = [
  {
    ignores: [
      "dist",
      "dist/**",
      "**/dist/**",
      ".turbo/**",
      ".next/**",
      "node_modules/**",

      "eslint.config.js",
      "src/app/layout.tsx",
      "src/app/page.tsx",
      "src/app/tools/bilt-calculator/**",
    ],
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      "@next/next/no-img-element": "off",
      "@next/next/no-page-custom-font": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/exhaustive-deps": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: [
      "src/app/tools/founder-coverage-planner/**/*.tsx",
      "src/app/tools/founder-coverage-planner/**/*.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
