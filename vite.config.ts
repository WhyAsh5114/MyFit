import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";

export default defineConfig({
	define: {
		"process.env.NODE_ENV": process.env.NODE_ENV === "production" ? '"production"' : '"development"'
	},
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			srcDir: "src",
			registerType: "prompt",
			strategies: "injectManifest",
			filename: "service-worker.ts",
			scope: "/",
			base: "/",
			manifest: {
				name: "MyFit v2",
				short_name: "MyFit",
				start_url: "/",
				display: "standalone",
				background_color: "#000000",
				theme_color: "#292524",
				orientation: "portrait",
				description: "A fitness app with all the logging and tracking options you'll ever need",
				icons: [
					{
					  src: 'pwa-64x64.png',
					  sizes: '64x64',
					  type: 'image/png'
					},
					{
					  src: 'pwa-192x192.png',
					  sizes: '192x192',
					  type: 'image/png'
					},
					{
					  src: 'pwa-512x512.png',
					  sizes: '512x512',
					  type: 'image/png',
					  purpose: 'any'  
					},
					{
					  src: 'maskable-icon-512x512.png',
					  sizes: '512x512',
					  type: 'image/png',
					  purpose: 'maskable'
					}
				  ]
			},
			injectManifest: {
				globPatterns: ["client/**/*.{js,css,ico,png,svg,webp,woff,woff2}"]
			},
			workbox: {
				globPatterns: ["client/**/*.{js,css,ico,png,svg,webp,woff,woff2}"]
			},
			devOptions: {
				enabled: true,
				type: "module"
			}
		})
	]
});
