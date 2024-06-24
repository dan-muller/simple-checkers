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
      'player-red-100': '#ef4444',
      'player-red-200': '#dc2626',
      'player-black-100': '#525252',
      'player-black-200': '#404040',
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
