export const activityEntryKeys = {
	all: ['activityEntry'] as const,
	byUser: (userId: string) => [...activityEntryKeys.all, userId] as const,
	byDate: (userId: string, date: string) => [...activityEntryKeys.byUser(userId), 'date', date] as const,
	byId: (userId: string, id: string) => [...activityEntryKeys.byUser(userId), 'id', id] as const
};
