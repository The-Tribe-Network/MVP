import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// ESLint 9 flat config: Next's recommended rules (core web vitals + TypeScript), as `next lint` ran them.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // A leading underscore marks a name as deliberately unused, and `const { a, ...rest } = x` is how
      // this codebase drops a field, so neither is reported.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    // The legacy web client's UI, which is on its way out and has no tests (TRI-364). Clearing these
    // React Compiler rules means moving state out of effects and refs out of render, i.e. behavioural
    // rewrites of untested components, so they are off here only. app/api and lib/ keep every rule.
    files: ["app-pages/**", "components/**"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
      "react-hooks/preserve-manual-memoization": "off",
      // Adding the missing deps changes when those effects re-run
      "react-hooks/exhaustive-deps": "off",
      // Only reports that react-hook-form's watch() and TanStack Table skip compilation; nothing to fix
      "react-hooks/incompatible-library": "off",
      // next/image changes sizing and loading and needs every remote host configured
      "@next/next/no-img-element": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
