/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                caveat: ['Caveat', 'sans-serif'],
                inter: ['Inter', 'sans-serif'],
            },
            colors: {
                purple: '#714b67',
                blue: '#1bb6f9',
                orange: '#fbb130',
                red: '#fc787d',
                green: '#00ceb3',
                body: '#374151'
            },
        },
    },
    plugins: [],
}
