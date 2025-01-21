import babelParser from "@babel/eslint-parser";
import globals from "globals";
import js from "@eslint/js";
import prettier from "eslint-plugin-prettier";
import react from "eslint-plugin-react";

export default [
  js.configs.recommended, // ESLint recommended JavaScript rules
  {
    ignores: ["node_modules/", "build/", "dev-build/"],
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"], // Define files directly, no "overrides" key
    plugins: {
      react: react,
      prettier: prettier,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        chrome: "readonly",
      },
      parser: babelParser, // Use Babel parser for JSX and modern JS
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-react"],
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-vars": "error",
      "react/prop-types": "off",
      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
  },
];
