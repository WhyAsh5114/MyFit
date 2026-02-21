export const foodEntryKeys = {
	all: ['foodEntry'] as const,
	byUser: (userId: string) => [...foodEntryKeys.all, userId] as const,
	byDate: (userId: string, date: string) => [...foodEntryKeys.byUser(userId), 'date', date] as const,
	byId: (userId: string, id: string) => [...foodEntryKeys.byUser(userId), 'id', id] as const
};
