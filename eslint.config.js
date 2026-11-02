// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: ["node_modules/", "dist/", "src/generated/"],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { varsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
    },
  },
  // Desliga as regras de estilo que conflitam com o Prettier; vem por último
  prettier,
);
