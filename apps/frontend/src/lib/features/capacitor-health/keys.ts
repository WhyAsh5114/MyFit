export const capacitorHealthKeys = {
	all: ['capacitorHealth'] as const,
	byDate: (date: string) => [...capacitorHealthKeys.all, 'byDate', date] as const,
	stepCount: (date: string) => [...capacitorHealthKeys.byDate(date), 'stepCount'] as const
};
