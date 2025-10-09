/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Paleta de colores APROMAM
      colors: {
        // Verde principal APROMAM
        primary: {
          DEFAULT: "#4a7c59",
          light: "#7ba05b",
          dark: "#3d6647",
        },
        // Dorado/Oro para acentos
        accent: {
          DEFAULT: "#d4a574",
          light: "#e0b88a",
          dark: "#c29760",
        },
        // Colores neutros
        neutral: {
          bg: "#f5f7f9",
          border: "#e2e8f0",
        },
        // Colores de texto
        text: {
          primary: "#2d3748",
          secondary: "#4a5568",
        },
        // Estados semánticos
        success: "#48bb78",
        warning: "#ed8936",
        error: "#f56565",
        info: "#3182ce",
      },
      // Sombras custom
      boxShadow: {
        sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
        DEFAULT: "0 4px 6px rgba(0, 0, 0, 0.1)",
        md: "0 4px 6px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px rgba(0, 0, 0, 0.15)",
      },
      // Bordes redondeados específicos
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "8px",
        lg: "12px",
        xl: "15px",
        "2xl": "20px",
      },
    },
  },
  plugins: [],
};
