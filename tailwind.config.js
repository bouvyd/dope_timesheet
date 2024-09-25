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
                purple: {
                    DEFAULT: '#714b67',
                    '50': '#f9f6f9',
                    '100': '#f4eff4',
                    '200': '#ebdfea',
                    '300': '#dbc6d8',
                    '400': '#c5a1c0',
                    '500': '#b084a9',
                    '600': '#99698e',
                    '700': '#825476',
                    '800': '#714b67',
                    '900': '#5c3f55',
                    '950': '#35222f',
                },
                blue: {
                    DEFAULT:'#1bb6f9',
                    '50': '#f0f9ff',
                    '100': '#e0f2fe',
                    '200': '#b9e6fe',
                    '300': '#7cd4fd',
                    '400': '#1bb6f9',
                    '500': '#0ca7eb',
                    '600': '#0086c9',
                    '700': '#026aa2',
                    '800': '#065a86',
                    '900': '#0b4b6f',
                    '950': '#072f4a',
                },
                yellow: {
                    DEFAULT:'#fbb130',
                    '50': '#fff9eb',
                    '100': '#feeec7',
                    '200': '#fddc8a',
                    '300': '#fcc44d',
                    '400': '#fbb130',
                    '500': '#f58a0b',
                    '600': '#d96506',
                    '700': '#b44409',
                    '800': '#92350e',
                    '900': '#782c0f',
                    '950': '#451403',
                },
                red: {
                    DEFAULT: '#fc787d',
                    '50': '#fef2f2',
                    '100': '#ffe1e2',
                    '200': '#ffc9cb',
                    '300': '#fea3a6',
                    '400': '#fc787d',
                    '500': '#f43f46',
                    '600': '#e12128',
                    '700': '#bd181e',
                    '800': '#9d171c',
                    '900': '#821a1e',
                    '950': '#47080a',
                },
                green: {
                    DEFAULT: '#00ceb3',
                    '50': '#eefffb',
                    '100': '#c6fff3',
                    '200': '#8effe9',
                    '300': '#4dfbdc',
                    '400': '#19e8ca',
                    '500': '#00ceb3',
                    '600': '#00a493',
                    '700': '#028376',
                    '800': '#08675f',
                    '900': '#0c554e',
                    '950': '#003432',
                },
                body: '#374151'
            },
        },
    },
    plugins: [],
}
