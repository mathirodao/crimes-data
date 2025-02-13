/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        colors: {
            'blue': '#598fde',
            'blue-dark': '#000033',
            'purple': '#7e5bef',
            'pink': '#ff49db',
            'orange': '#ff7849',
            'green': '#13ce66',
            'yellow': '#ffc82c',
            'gray-dark': '#273444',
            'gray': '#8492a6',
            'gray-light': '#d3dce6',
            'black': '#000000',
            'white': '#ffffff',
        },
        extend: {
            gridAutoColumns: {
                '2fr': 'minmax(0, 2fr)',
            },
            screens: {
                'xs': '480px', // Pantallas extra pequeñas
            },
            backgroundImage: {
                'gradient-blue-transparent': 'linear-gradient(to bottom, #598fde, transparent)',
            },
            backgroundClip: {
                'text': 'text', // Habilita background-clip: text
            },
            animation: {
                fadeIn: 'fadeIn 1s ease-in-out',
                slideInLeft: 'slideInLeft 1s ease-out forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                }
            },
        },
        plugins: [],
    }
}