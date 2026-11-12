// A photo id is a random UUID scoped to its owner by the API, so it needs no user segment.
export const chatImageKeys = {
	all: ['chatImage'] as const,
	byId: (id: string) => [...chatImageKeys.all, 'id', id] as const
};
