import type { Config } from 'tailwindcss';

// Tailwind CSS v4 uses CSS-first configuration via @theme in globals.css.
// This file is kept minimal for tooling/editor integration and content paths.
const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
};

export default config;
