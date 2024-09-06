import { browser, dev } from '$app/environment';
import posthog from 'posthog-js';

export const load = async () => {
	if (browser && !dev) {
		posthog.init('phc_QZNnbrh9605g46soHXsZXGXsbob5XHT1w7wopjS7Sha', {
			api_host: 'https://us.i.posthog.com',
			person_profiles: 'always'
		});
	}
	return;
};
