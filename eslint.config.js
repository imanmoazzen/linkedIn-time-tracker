import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

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
    rules: {
      "react/react-in-jsx-scope": "off", // ✅ No need to import React in React 17+
    },
  },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
];
