export const chatKeys = {
	all: ['chat'] as const,
	byUser: (userId: string) => [...chatKeys.all, userId] as const,
	byId: (userId: string, id: string) => [...chatKeys.byUser(userId), 'id', id] as const
};
