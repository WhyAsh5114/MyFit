const daisyui = require("daisyui");

/** @type {import('tailwindcss').Config}*/
const config = {
	content: ["./src/**/*.{html,js,svelte,ts}"],

	theme: {
		extend: {}
	},

	plugins: [daisyui],
	daisyui: {
		themes: [
			{
				myTheme: {
					primary: "#29313d",
					secondary: "#f4f4f4",
					accent: "#30c9b5",
					neutral: "#0f0e0e",
					"base-100": "#000000",
					info: "#3ABFF8",
					success: "#22c55e",
					warning: "#facc15",
					error: "#ff4747"
				}
			}
		]
	}
};

module.exports = config;
