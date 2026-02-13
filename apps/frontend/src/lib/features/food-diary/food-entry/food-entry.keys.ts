export const foodEntryKeys = {
	all: ['foodEntry'] as const,
	getByDateQuery: (date: string) => [...foodEntryKeys.all, 'date', date] as const
};
