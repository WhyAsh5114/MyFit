export const mealKeys = {
	all: ['meal'] as const,
	byUser: (userId: string) => [...mealKeys.all, userId] as const
};
