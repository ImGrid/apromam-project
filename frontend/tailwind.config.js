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
        // Colores neutros - Escala completa
        neutral: {
          50: "#f9fafb",
          100: "#f5f7f9",
          200: "#e2e8f0",
          300: "#cbd5e0",
          400: "#a0aec0",
          500: "#718096",
          600: "#4a5568",
          700: "#2d3748",
          800: "#1a202c",
          900: "#171923",
          // Aliases para compatibilidad
          bg: "#f5f7f9",
          border: "#e2e8f0",
        },
        // Colores de texto
        text: {
          primary: "#2d3748",
          secondary: "#4a5568",
          tertiary: "#718096",
          disabled: "#a0aec0",
        },
        // Estados semánticos - Con variantes completas
        success: {
          DEFAULT: "#48bb78",
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#48bb78",
          600: "#2f855a",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        warning: {
          DEFAULT: "#ed8936",
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#ed8936",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        error: {
          DEFAULT: "#f56565",
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#f56565",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },
        info: {
          DEFAULT: "#3182ce",
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3182ce",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        // Color púrpura para acciones especiales
        purple: {
          DEFAULT: "#9333ea",
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
        },
        // Colores para roles de usuario
        role: {
          admin: {
            bg: "#f3e8ff",
            text: "#6b21a8",
            border: "#d8b4fe",
          },
          gerente: {
            bg: "#dbeafe",
            text: "#1e40af",
            border: "#93c5fd",
          },
          tecnico: {
            bg: "#d1fae5",
            text: "#065f46",
            border: "#6ee7b7",
          },
          productor: {
            bg: "#fef3c7",
            text: "#92400e",
            border: "#fcd34d",
          },
        },
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
