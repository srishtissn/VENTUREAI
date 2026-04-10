module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#6c63ff', accent: '#00d4aa', danger: '#ff6b6b',
        bg: '#0a0a0f', bg2: '#12121a', bg3: '#1a1a27',
      },
      fontFamily: {
        display: ['Clash Display', 'sans-serif'],
        body: ['Cabinet Grotesk', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      animation: { 'spin-slow': 'spin 3s linear infinite' },
    },
  },
  plugins: [],
};
