export interface QuoteFrequencySettings {
	type: 'random' | 'every_x_sets';
	randomChance: number; // Percentage (0-100)
	everyXSets: number; // Show every X sets
}

const DEFAULT_SETTINGS: QuoteFrequencySettings = {
	type: 'every_x_sets',
	randomChance: 100,
	everyXSets: 3
};

function createQuoteFrequencyRunes() {
	let settings = $state<QuoteFrequencySettings>(structuredClone(DEFAULT_SETTINGS));
	let initialized = $state(false);

	function saveToLocalStorage() {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('quote-frequency-settings', JSON.stringify(settings));
		}
	}

	function loadFromLocalStorage() {
		if (typeof localStorage !== 'undefined') {
			const saved = localStorage.getItem('quote-frequency-settings');
			if (saved) {
				try {
					const parsed = JSON.parse(saved) as QuoteFrequencySettings;
					settings = { ...DEFAULT_SETTINGS, ...parsed };
				} catch {
					settings = structuredClone(DEFAULT_SETTINGS);
				}
			}
		}
		initialized = true;
	}

	function shouldShowQuote(completedSets: number): boolean {
		if (!initialized) return false;

		if (settings.type === 'every_x_sets') {
			return completedSets > 0 && completedSets % settings.everyXSets === 0;
		} else {
			// Random chance after every set
			return Math.random() * 100 < settings.randomChance;
		}
	}

	function updateSettings(newSettings: Partial<QuoteFrequencySettings>) {
		settings = { ...settings, ...newSettings };
		saveToLocalStorage();
	}

	return {
		get settings() {
			return settings;
		},
		get initialized() {
			return initialized;
		},
		shouldShowQuote,
		updateSettings,
		loadFromLocalStorage,
		saveToLocalStorage
	};
}

export const quoteFrequencyRunes = createQuoteFrequencyRunes();
