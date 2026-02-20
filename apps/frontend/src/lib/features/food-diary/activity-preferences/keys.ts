export const activityPreferencesKeys = {
	all: ['activityPreferences'] as const,
	byUser: (userId: string) => [...activityPreferencesKeys.all, userId] as const
};
