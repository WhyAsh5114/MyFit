export const accountKeys = {
	all: ['account'] as const,

	detail: (userId: string) =>
		[...accountKeys.all, 'detail', userId] as const,

	updateName: (userId: string) =>
		[...accountKeys.detail(userId), 'update-name'] as const
};
