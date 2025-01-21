import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser, // Enables browser globals (window, document, etc.)
        ...globals.node, // Enables Node.js globals (process, __dirname, etc.)
        chrome: "readonly",
      },
    },
    settings: {
      react: {
        version: "detect", // Automatically detects React version
      },
    },
  },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
];
