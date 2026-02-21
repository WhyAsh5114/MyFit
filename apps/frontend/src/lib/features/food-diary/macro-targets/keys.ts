export const macroTargetsKeys = {
	all: ['macroTargets'] as const,
	byUser: (userId: string) => [...macroTargetsKeys.all, userId] as const,
	byDate: (userId: string, date: string) => [...macroTargetsKeys.byUser(userId), date] as const
};
