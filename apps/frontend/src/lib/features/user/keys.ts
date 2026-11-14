export const userKeys = {
	all: ['user'] as const,
	byUser: (userId: string) => [...userKeys.all, userId] as const
};
