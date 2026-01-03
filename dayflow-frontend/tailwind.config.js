/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#3B82F6', // Blue-500
                    foreground: '#FFFFFF',
                },
                secondary: {
                    DEFAULT: '#8B5CF6', // Violet-500
                    foreground: '#FFFFFF',
                },
                background: '#0F172A', // Slate-900 (Dark mode base)
                surface: '#1E293B', // Slate-800
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
