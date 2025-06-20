import type { PageServerLoad } from './$types';
import { createCaller } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';
import { QuotesDisplayModeSchema } from '$lib/zodSchemas';

export const load: PageServerLoad = async (event) => {
	event.depends('settings:userSettings');
	const trpc = createCaller(await createContext(event));

	try {
		const userSettings = await trpc.users.getUserSettings();

		if (!userSettings) {
			return {
				hasError: false,
				userSettings: {
					motivationalQuotesEnabled: false,
					quotesDisplayMode: QuotesDisplayModeSchema.Values.PRE_WORKOUT
				}
			};
		}

		const validatedQuotesDisplayMode = QuotesDisplayModeSchema.safeParse(userSettings.quotesDisplayMode);

		return {
			hasError: false,
			userSettings: {
				quotesDisplayMode: validatedQuotesDisplayMode.success
					? validatedQuotesDisplayMode.data
					: QuotesDisplayModeSchema.Values.PRE_WORKOUT,
				motivationalQuotesEnabled: Boolean(userSettings.motivationalQuotesEnabled)
			}
		};
	} catch (error) {
		console.error('Failed to load settings:', error);

		return {
			hasError: true,
			userSettings: {
				motivationalQuotesEnabled: false,
				quotesDisplayMode: QuotesDisplayModeSchema.Values.PRE_WORKOUT
			},
			errorMessage: error instanceof Error ? error.message : 'Failed to load settings:'
		};
	}
};
