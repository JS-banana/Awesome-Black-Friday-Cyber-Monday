import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const nextPlugin = require("@next/eslint-plugin-next");

const tsRules = tsPlugin.configs["recommended"].rules;
const nextRecommended = nextPlugin.configs["recommended"].rules;
const nextCoreVitals = nextPlugin.configs["core-web-vitals"].rules;

export default [
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname
      },
      globals: {
        React: "readonly",
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        process: "readonly"
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "@next/next": nextPlugin
    },
    rules: {
      ...tsRules,
      ...nextRecommended,
      ...nextCoreVitals
    }
  },
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"]
  }
];
