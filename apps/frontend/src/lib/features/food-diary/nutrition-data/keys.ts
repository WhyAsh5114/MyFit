export const nutritionDataKeys = {
	all: ['nutritionData'] as const,
	search: (search: string) => [...nutritionDataKeys.all, 'search', search] as const,
	byId: (id: string) => [...nutritionDataKeys.all, 'id', id] as const,
	byCode: (code: string) => [...nutritionDataKeys.all, 'code', code] as const
};
