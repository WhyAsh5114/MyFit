export const userKeys = {
	all: ['user'] as const,

	current: () => [...userKeys.all, 'current'] as const
};
