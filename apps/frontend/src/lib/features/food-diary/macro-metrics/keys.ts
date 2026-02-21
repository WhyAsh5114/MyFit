export const macroMetricsKeys = {
	all: ['macroMetrics'] as const,
	byUser: (userId: string) => [...macroMetricsKeys.all, userId] as const,
	byDate: (userId: string, date: string) => [...macroMetricsKeys.byUser(userId), date] as const
};
