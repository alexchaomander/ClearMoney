import nextConfig from "eslint-config-next";

const config = [
  ...nextConfig,
  {
    ignores: ["dist/**", "legacy/**"],
  },
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default config;
