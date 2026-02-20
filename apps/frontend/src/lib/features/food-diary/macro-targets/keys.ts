export const macroTargetsKeys = {
	all: ['macroTargets'] as const,
	byUser: (userId: string) => [...macroTargetsKeys.all, userId] as const
};
