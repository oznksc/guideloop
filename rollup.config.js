import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import external from "rollup-plugin-peer-deps-external";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.js",
      format: "cjs",
      sourcemap: true,
    },
    {
      file: "dist/index.esm.js",
      format: "esm",
      sourcemap: true,
    },
  ],
  plugins: [
    external(),
    resolve(),
    commonjs(),
    typescript({ 
      tsconfig: "./tsconfig.json",
      declaration: true,
      declarationDir: "dist/types",
      exclude: ["**/*.test.tsx", "**/*.test.ts", "**/*.stories.tsx"]
    }),
    terser(),
  ],
  external: ["react", "react-dom"]
};