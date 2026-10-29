// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	/** The OTA channel this build belongs to, set by `vite.config.ts` from `scripts/ota-channel.js`. */
	const __OTA_CHANNEL__: string;

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
