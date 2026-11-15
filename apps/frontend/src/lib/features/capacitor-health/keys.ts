export const capacitorHealthKeys = {
	all: ['capacitorHealth'] as const,
	steps: () => [...capacitorHealthKeys.all, 'steps'] as const,
	stepsByDate: (date: string) => [...capacitorHealthKeys.steps(), 'date', date] as const
};
