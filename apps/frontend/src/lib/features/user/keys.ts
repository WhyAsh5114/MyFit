export const userKeys = {
	all: ['user'] as const,

	detail: (userId: string) => [...userKeys.all, 'detail', userId] as const
};
