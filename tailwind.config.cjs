/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {}
	},
	plugins: [require('daisyui')],
	daisyui: {
		themes: [
			{
				mytheme: {
					primary: '#323b49',
					secondary: '#f3f4f6',
					accent: '#22d3ee',
					neutral: '#292524',
					'base-100': '#1c1917',
					info: '#3ABFF8',
					success: '#22c55e',
					warning: '#facc15',
					error: '#dc2626'
				}
			}
		]
	}
};
