import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import boundaries from "eslint-plugin-boundaries";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      boundaries,
    },
    settings: {
      "boundaries/elements": [
        {
          type: "app",
          pattern: "src/app/**/*",
        },
        {
          type: "widgets",
          pattern: "src/widgets/**/*",
        },
        {
          type: "features",
          pattern: "src/features/**/*",
        },
        {
          type: "entities",
          pattern: "src/entities/**/*",
        },
        {
          type: "shared",
          pattern: "src/shared/**/*",
        },
      ],
      "boundaries/ignore": [
        "**/*.test.*",
        "**/*.spec.*",
        "**/*.stories.*",
      ],
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            {
              from: "app",
              allow: ["widgets", "features", "entities", "shared"],
            },
            {
              from: "widgets",
              allow: ["features", "entities", "shared"],
            },
            {
              from: "features",
              allow: ["entities", "shared"],
            },
            {
              from: "entities",
              allow: ["shared"],
            },
            {
              from: "shared",
              allow: ["shared"],
            },
          ],
        },
      ],
      "boundaries/entry-point": [
        "error",
        {
          default: "disallow",
          rules: [
            {
              target: ["entities", "features", "widgets"],
              allow: "index.{js,ts,tsx}",
            },
            {
              target: "shared",
              allow: "**",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
