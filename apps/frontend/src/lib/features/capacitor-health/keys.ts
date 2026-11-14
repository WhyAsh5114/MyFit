export const capacitorHealthKeys = {
	all: ['capacitorHealth'] as const,
	byDate: (date: string) => [...capacitorHealthKeys.all, 'date', date] as const,
	stepCount: (date: string) => [...capacitorHealthKeys.byDate(date), 'stepCount'] as const
};
