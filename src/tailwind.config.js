/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom dark mode palette if needed, though standard Tailwind colors work well
      },
      fontFamily: {
        // Enforce the terminal look
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // Optional but good for the AI analysis text
  ],
}
