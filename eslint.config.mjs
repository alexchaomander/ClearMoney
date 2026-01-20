import nextConfig from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: ["dist/**", "legacy/**", ".next/**", "node_modules/**"],
  },
  ...nextConfig,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-page-custom-font": "off",
      "import/no-anonymous-default-export": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default config;
