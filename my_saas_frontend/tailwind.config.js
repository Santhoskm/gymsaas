/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#E8001D",
          orange: "#FF5500",
          amber: "#FF8C00",
          dark: "#0A0A0A",
          surface: "#111111",
          card: "#1A1A1A",
          border: "#2A2A2A",
          muted: "#3A3A3A",
          text: "#E5E5E5",
          subtle: "#888888",
        },
      },
      fontFamily: {
        display: ["'Barlow Condensed'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-pattern":
          "linear-gradient(135deg, #0A0A0A 0%, #1a0505 50%, #0A0A0A 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "pulse-red": "pulseRed 2s infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideIn: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        pulseRed: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(232,0,29,0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(232,0,29,0)" },
        },
      },
    },
  },
  plugins: [],
};
