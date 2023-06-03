/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {}
	},
	plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        myTheme: {
          primary: '#323b49',
          secondary: '#f4f4f4',
          accent: '#30c9b5',
          neutral: '#292524',
          'base-100': '#000000',
          info: '#3ABFF8',
          success: '#22c55e',
          warning: '#facc15',
          error: '#ff4747'
        }
      }
    ]
  }
};
