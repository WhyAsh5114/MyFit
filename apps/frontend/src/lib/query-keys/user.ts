export const userKeys = {
	all: ['user'] as const,

	current: () => [...userKeys.all, 'current'] as const,

	detail: (userId: string) => [...userKeys.all, 'detail', userId] as const
};
