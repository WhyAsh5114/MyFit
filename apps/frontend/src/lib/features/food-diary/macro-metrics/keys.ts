export const macroMetricsKeys = {
	all: ['macroMetrics'] as const,
	byUser: (userId: string) => [...macroMetricsKeys.all, userId] as const
};
