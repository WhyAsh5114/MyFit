// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Row } from '@myfit/shared/client';

declare global {
	/** The OTA channel this build belongs to, set by `vite.config.ts` from `scripts/ota-channel.js`. */
	const __OTA_CHANNEL__: string;

	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			/** The account the local database belongs to, from the `(app)` layout. */
			ownerId?: string | null;
			user?: Row<'User'> | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
