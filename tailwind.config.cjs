const daisyui = require("daisyui");

/** @type {import('tailwindcss').Config}*/
const config = {
	content: ["./src/**/*.{html,js,svelte,ts}"],

	theme: {
		extend: {}
	},

	plugins: [daisyui],
	daisyui: {
		themes: ["forest"]
	}
};

module.exports = config;
