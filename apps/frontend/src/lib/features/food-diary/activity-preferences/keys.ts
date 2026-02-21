export const activityPreferencesKeys = {
	all: ['activityPreferences'] as const,
	byUser: (userId: string) => [...activityPreferencesKeys.all, userId] as const,
	byDate: (userId: string, date: string) =>
		[...activityPreferencesKeys.byUser(userId), date] as const
};
