export const foodDiaryKeys = {
	all: ['foodDiary'] as const,
	searchQuery: (search: string) => [...foodDiaryKeys.all, 'search', search] as const,
	getByCodeQuery: (code: string) => [...foodDiaryKeys.all, 'code', code] as const
};
