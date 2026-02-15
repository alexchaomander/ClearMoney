const nextCoreWebVitals = require("eslint-config-next/core-web-vitals");
const nextTypescript = require("eslint-config-next/typescript");

module.exports = [
  {
    ignores: [
      "dist/**",
      ".next/**",
      "node_modules/**",

      "eslint.config.js",
      "src/app/layout.tsx",
      "src/app/page.tsx",
      "src/app/tools/bilt-calculator/**",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
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
