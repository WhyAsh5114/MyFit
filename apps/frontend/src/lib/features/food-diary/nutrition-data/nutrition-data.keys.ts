export const nutritionDataKeys = {
	all: ['nutritionData'] as const,
	searchQuery: (search: string) => [...nutritionDataKeys.all, 'search', search] as const,
	getByIdQuery: (id: string) => [...nutritionDataKeys.all, 'id', id] as const,
	getByCodeQuery: (code: string) => [...nutritionDataKeys.all, 'code', code] as const
};
