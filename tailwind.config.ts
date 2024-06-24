import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    colors: {
      'tile-light': 'hsl(var(--color-tile-light) / <alpha-value>)',
      'tile-dark': 'hsl(var(--color-tile-dark) / <alpha-value>)',
      'player-red-100': 'hsl(var(--color-player-red-100) / <alpha-value>)',
      'player-red-200': 'hsl(var(--color-player-red-200) / <alpha-value>)',
      'player-black-100': 'hsl(var(--color-player-black-100) / <alpha-value>)',
      'player-black-200': 'hsl(var(--color-player-black-200) / <alpha-value>)',
    },
    extend: {
      backgroundImage: {
        'board-img': 'var(--board-bg-url)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      gridTemplateColumns: { checkerboard: 'min-content repeat(8, 1fr)' },
      gridTemplateRows: { checkerboard: 'min-content repeat(8, 1fr)' },
    },
  },
  plugins: [require('tailwindcss-animation-delay'), require('tailwind-scrollbar'), require('@tailwindcss/forms')],
};
export default config;
