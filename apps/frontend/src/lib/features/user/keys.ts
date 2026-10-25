export const userKeys = {
	all: ['user'] as const,

	current: (ownerId: string | null) => [...userKeys.all, 'current', ownerId] as const,

	detail: (userId: string) => [...userKeys.all, 'detail', userId] as const
};
