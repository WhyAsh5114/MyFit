export const foodEntryKeys = {
	all: ['foodEntry'] as const,
	list: (userId: string) => [...foodEntryKeys.all, userId] as const,
	byDate: (userId: string, date: string) => [...foodEntryKeys.list(userId), 'date', date] as const,
	byId: (userId: string, id: string) => [...foodEntryKeys.list(userId), 'id', id] as const
};
