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
];
