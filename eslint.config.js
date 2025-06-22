import tseslint from "typescript-eslint";
import eslintPluginImport from "eslint-plugin-import";
import eslintPluginPrettier from "eslint-plugin-prettier";

export default [
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      import: eslintPluginImport,
      prettier: eslintPluginPrettier, 
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
      },
    },
    rules: {
      // Imports
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],

     // ✅ Spacing / Formatting
      "no-multiple-empty-lines": ["warn", { max: 1 }],
      "padding-line-between-statements": [
        "warn",
        { blankLine: "always", prev: "*", next: "return" },
        { blankLine: "always", prev: "import", next: "*" },
        { blankLine: "any", prev: "import", next: "import" },
        { blankLine: "always", prev: "*", next: "block-like" },
        { blankLine: "always", prev: "block-like", next: "*" },
      ],
    },
  },
];
