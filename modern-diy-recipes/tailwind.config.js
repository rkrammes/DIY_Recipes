/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/providers/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: withOpacity('--surface-0'),
        foreground: withOpacity('--text-primary'),
        'surface-0': withOpacity('--surface-0'),
        'surface-1': withOpacity('--surface-1'),
        'surface-2': withOpacity('--surface-2'),
        'text-primary': withOpacity('--text-primary'),
        'text-secondary': withOpacity('--text-secondary'),
        'border-subtle': withOpacity('--border-subtle'),
        accent: withOpacity('--accent'),
        'accent-hover': withOpacity('--accent-hover'),
        'glow-pulse': withOpacity('--glow-pulse'),
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
    },
  },
  plugins: [],
};

// Function to handle OKLCH color opacity
function withOpacity(variable) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `oklch(var(${variable}-components))`;
    }
    // Handle OKLCH values with opacity
    return `color-mix(in oklch, oklch(var(${variable}-components)), transparent ${(1 - Number(opacityValue)) * 100}%)`;
  };
}