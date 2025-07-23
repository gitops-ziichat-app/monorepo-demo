import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  target: 'node18',
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  external: [],
  noExternal: ['@gitops-ziichat-app/utils'],
});

