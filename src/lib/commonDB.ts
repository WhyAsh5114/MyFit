export const commonSplits: Record<string, string[]> = {
	'Push Pull Legs': ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', ''],
	'Upper Lower': ['Upper', 'Lower', '', 'Upper', 'Lower', '', ''],
	'Full body': ['Full body', '', '', 'Full body', '', '', '']
};

export const commonMuscleGroups = [
	'Chest',
	'Front delts',
	'Side delts',
	'Rear delts',
	'Back',
	'Traps',
	'Triceps',
	'Biceps',
	'Forearms',
	'Quads',
	'Hamstrings',
	'Glutes',
	'Calves'
] as const;
