// See https://svelte.dev/docs/kit/types#app.d.ts
import 'vite-plugin-pwa/info';
import 'vite-plugin-pwa/svelte';
import type { StepRoutesMap } from '$lib/scripts/routes';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			stepRoutesMap?: StepRoutesMap;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
