/** @type {import('tailwindcss').Config}*/
const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {}
	},

	plugins: [require('daisyui')],
	daisyui: {
		themes: [
			{
				mytheme: {
					primary: '#303b55',
					secondary: '#f4f4f4',
					accent: '#30c9b5',
					neutral: '#292524',
					'base-100': '#000000',
					info: '#3abff8',
					success: '#22c55e',
					warning: '#facc15',
					error: '#dd0000'
				}
			}
		]
	}
};

module.exports = config;
