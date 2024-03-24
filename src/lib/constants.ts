export const EXERCISE_SPLITS_PER_PAGE = 5;

export const muscleGroups: typeof MuscleGroups = [
	'Chest',
	'Front delts',
	'Side delts',
	'Rear delts',
	'Lats',
	'Traps',
	'Triceps',
	'Biceps',
	'Forearms',
	'Quads',
	'Hamstrings',
	'Glutes',
	'Calves',
	'Abs'
] as const;

export const setTypes: typeof SetTypes = [
	'straight',
	'drop',
	'down',
	'top',
	'myorep',
	'myorep match',
	'giant'
] as const;

export const exerciseListByMuscleGroup: {
	muscleGroup: MuscleGroup;
	exercises: ExerciseTemplate[];
}[] = [
	{
		muscleGroup: 'Chest',
		exercises: [
			{
				name: 'Barbell bench press',
				repRangeStart: 5,
				repRangeEnd: 10,
				setType: 'straight',
				sets: 3,
				targetMuscleGroup: 'Chest',
				involvesBodyweight: false
			},
			{
				name: 'Dumbbell flyes',
				repRangeStart: 10,
				repRangeEnd: 20,
				setType: 'straight',
				sets: 3,
				targetMuscleGroup: 'Chest',
				involvesBodyweight: false
			}
		]
	},
	{
		muscleGroup: 'Front delts',
		exercises: [
			{
				name: 'Overhead dumbbell press',
				repRangeStart: 5,
				repRangeEnd: 10,
				setType: 'straight',
				sets: 3,
				targetMuscleGroup: 'Front delts',
				involvesBodyweight: false
			},
			{
				name: 'Front raises',
				repRangeStart: 10,
				repRangeEnd: 20,
				setType: 'straight',
				sets: 3,
				targetMuscleGroup: 'Front delts',
				involvesBodyweight: false
			}
		]
	},
	{
		muscleGroup: 'Side delts',
		exercises: [
			{
				name: 'Lateral raises',
				repRangeStart: 10,
				repRangeEnd: 20,
				setType: 'straight',
				sets: 3,
				targetMuscleGroup: 'Side delts',
				involvesBodyweight: false
			}
		]
	},
	{
		muscleGroup: 'Rear delts',
		exercises: [
			{
				name: 'Face pulls',
				repRangeStart: 10,
				repRangeEnd: 20,
				setType: 'straight',
				sets: 3,
				targetMuscleGroup: 'Rear delts',
				involvesBodyweight: false
			}
		]
	},
	{
		muscleGroup: 'Lats',
		exercises: [
			{
				name: 'Pull-ups',
				repRangeStart: 5,
				repRangeEnd: 10,
				setType: 'straight',
				sets: 3,
				targetMuscleGroup: 'Lats',
				involvesBodyweight: true
			},
			{
				name: 'Lat pulldowns',
				repRangeStart: 10,
				repRangeEnd: 20,
				setType: 'straight',
				sets: 3,
				targetMuscleGroup: 'Lats',
				involvesBodyweight: false
			}
		]
	},
	{
		muscleGroup: 'Traps',
		exercises: [
			{
				name: 'Barbell shrugs',
				repRangeStart: 10,
				repRangeEnd: 20,
				setType: 'straight',
				sets: 3,
				targetMuscleGroup: 'Traps',
				involvesBodyweight: false
			}
		]
	},
	{
		muscleGroup: 'Triceps',
		exercises: [
			{
				name: 'Close-grip bench press',
				repRangeStart: 5,
				repRangeEnd: 10,
				setType: 'straight',
				sets: 3,
				targetMuscleGroup: 'Triceps',
				involvesBodyweight: false
			},
			{
				name: 'Tricep dips',
				repRangeStart: 10,
				repRangeEnd: 20,
				setType: 'straight',
				sets: 3,
				targetMuscleGroup: 'Triceps',
				involvesBodyweight: true
			}
		]
	},
	{
		muscleGroup: 'Biceps',
		exercises: [
			{
				name: 'Barbell curls',
				repRangeStart: 5,
				repRangeEnd: 10,
				setType: 'straight',
				sets: 3,
				targetMuscleGroup: 'Biceps',
				involvesBodyweight: false
			},
			{
				name: 'Dumbbell hammer curls',
				repRangeStart: 10,
				repRangeEnd: 20,
				setType: 'straight',
				sets: 3,
				targetMuscleGroup: 'Biceps',
				involvesBodyweight: false
			}
		]
	},
	{
		muscleGroup: 'Forearms',
		exercises: [
			{
				name: 'Wrist curls',
				repRangeStart: 10,
				repRangeEnd: 20,
				setType: 'straight',
				sets: 3,
				targetMuscleGroup: 'Forearms',
				involvesBodyweight: false
			}
		]
	},
	{
		muscleGroup: 'Quads',
		exercises: [
			{
				name: 'Barbell squats',
				repRangeStart: 5,
				repRangeEnd: 10,
				setType: 'straight',
				sets: 3,
				targetMuscleGroup: 'Quads',
				involvesBodyweight: true
			},
			{
				name: 'Leg press',
				repRangeStart: 10,
				repRangeEnd: 20,
				setType: 'straight',
				sets: 3,
				targetMuscleGroup: 'Quads',
				involvesBodyweight: false
			}
		]
	},
	{
		muscleGroup: 'Hamstrings',
		exercises: [
			{
				name: 'Romanian deadlifts',
				repRangeStart: 5,
				repRangeEnd: 10,
				setType: 'straight',
				sets: 3,
				targetMuscleGroup: 'Hamstrings',
				involvesBodyweight: false
			},
			{
				name: 'Leg curls',
				repRangeStart: 10,
				repRangeEnd: 20,
				setType: 'straight',
				sets: 3,
				targetMuscleGroup: 'Hamstrings',
				involvesBodyweight: false
			}
		]
	},
	{
		muscleGroup: 'Glutes',
		exercises: [
			{
				name: 'Hip thrusts',
				repRangeStart: 10,
				repRangeEnd: 20,
				setType: 'straight',
				sets: 3,
				targetMuscleGroup: 'Glutes',
				involvesBodyweight: false
			}
		]
	},
	{
		muscleGroup: 'Calves',
		exercises: [
			{
				name: 'Standing calf raises',
				repRangeStart: 10,
				repRangeEnd: 20,
				setType: 'straight',
				sets: 3,
				targetMuscleGroup: 'Calves',
				involvesBodyweight: true
			}
		]
	},
	{
		muscleGroup: 'Abs',
		exercises: [
			{
				name: 'Crunches',
				repRangeStart: 10,
				repRangeEnd: 20,
				setType: 'straight',
				sets: 3,
				targetMuscleGroup: 'Abs',
				involvesBodyweight: true
			},
			{
				name: 'Leg raises',
				repRangeStart: 10,
				repRangeEnd: 20,
				setType: 'straight',
				sets: 3,
				targetMuscleGroup: 'Abs',
				involvesBodyweight: true
			}
		]
	}
];

export const templateExerciseSplits: { description: string; exerciseSplit: ExerciseSplit }[] = [
	{
		description: 'Standard 7-day split with 2x frequency for most major muscle groups',
		exerciseSplit: {
			name: 'Push Pull Legs',
			splitDays: [
				{
					name: 'Push A',
					exerciseTemplates: [
						{
							name: 'Bench press',
							sets: 3,
							targetMuscleGroup: 'Chest',
							setType: 'straight',
							repRangeStart: 5,
							repRangeEnd: 10,
							involvesBodyweight: false
						},
						{
							name: 'Push ups',
							sets: 3,
							targetMuscleGroup: 'Chest',
							setType: 'straight',
							repRangeStart: 10,
							repRangeEnd: 20,
							involvesBodyweight: true
						},
						{
							name: 'Overhead triceps extensions',
							sets: 3,
							targetMuscleGroup: 'Triceps',
							setType: 'straight',
							repRangeStart: 10,
							repRangeEnd: 20,
							involvesBodyweight: false
						},
						{
							name: 'Dumbbell lateral raises',
							sets: 3,
							targetMuscleGroup: 'Side delts',
							setType: 'straight',
							repRangeStart: 20,
							repRangeEnd: 30,
							involvesBodyweight: false
						}
					]
				},
				{
					name: 'Pull A',
					exerciseTemplates: [
						{
							name: 'Pull up',
							sets: 3,
							targetMuscleGroup: 'Lats',
							setType: 'straight',
							repRangeStart: 5,
							repRangeEnd: 15,
							involvesBodyweight: true
						},
						{
							name: 'Barbell rows',
							sets: 3,
							targetMuscleGroup: 'Traps',
							setType: 'straight',
							repRangeStart: 10,
							repRangeEnd: 15,
							involvesBodyweight: false
						},
						{
							name: 'Dumbbell curls',
							sets: 3,
							targetMuscleGroup: 'Biceps',
							setType: 'straight',
							repRangeStart: 15,
							repRangeEnd: 20,
							involvesBodyweight: false
						},
						{
							name: 'Upright rows',
							sets: 3,
							targetMuscleGroup: 'Side delts',
							setType: 'straight',
							repRangeStart: 10,
							repRangeEnd: 20,
							involvesBodyweight: false
						}
					]
				},
				{
					name: 'Legs A',
					exerciseTemplates: [
						{
							name: 'Barbell squats',
							sets: 3,
							targetMuscleGroup: 'Quads',
							setType: 'down',
							repRangeStart: 5,
							repRangeEnd: 10,
							involvesBodyweight: true
						},
						{
							name: 'Leg extensions',
							sets: 2,
							targetMuscleGroup: 'Quads',
							setType: 'straight',
							repRangeStart: 15,
							repRangeEnd: 20,
							involvesBodyweight: false
						},
						{
							name: 'Leg curls',
							sets: 2,
							targetMuscleGroup: 'Hamstrings',
							setType: 'straight',
							repRangeStart: 10,
							repRangeEnd: 20,
							involvesBodyweight: false
						},
						{
							name: 'Calf raises',
							sets: 3,
							targetMuscleGroup: 'Calves',
							setType: 'straight',
							repRangeStart: 10,
							repRangeEnd: 15,
							involvesBodyweight: true
						}
					]
				},
				{
					name: 'Push B',
					exerciseTemplates: [
						{
							name: 'Incline dumbbell press',
							sets: 3,
							targetMuscleGroup: 'Chest',
							setType: 'straight',
							repRangeStart: 10,
							repRangeEnd: 20,
							involvesBodyweight: false
						},
						{
							name: 'Pec flyes',
							sets: 3,
							targetMuscleGroup: 'Chest',
							setType: 'straight',
							repRangeStart: 10,
							repRangeEnd: 20,
							involvesBodyweight: true
						},
						{
							name: 'Overhead triceps extensions',
							sets: 3,
							targetMuscleGroup: 'Triceps',
							setType: 'straight',
							repRangeStart: 10,
							repRangeEnd: 20,
							involvesBodyweight: false
						},
						{
							name: 'Dumbbell lateral raises',
							sets: 3,
							targetMuscleGroup: 'Side delts',
							setType: 'straight',
							repRangeStart: 20,
							repRangeEnd: 30,
							involvesBodyweight: false
						}
					]
				},
				{
					name: 'Pull B',
					exerciseTemplates: [
						{
							name: 'Wide grip pull ups',
							sets: 3,
							targetMuscleGroup: 'Lats',
							setType: 'straight',
							repRangeStart: 5,
							repRangeEnd: 15,
							involvesBodyweight: true
						},
						{
							name: 'Dumbbell rows',
							sets: 3,
							targetMuscleGroup: 'Traps',
							setType: 'straight',
							repRangeStart: 10,
							repRangeEnd: 15,
							involvesBodyweight: false
						},
						{
							name: 'Preacher curls',
							sets: 3,
							targetMuscleGroup: 'Biceps',
							setType: 'straight',
							repRangeStart: 15,
							repRangeEnd: 20,
							involvesBodyweight: false
						},
						{
							name: 'Cable upright rows',
							sets: 3,
							targetMuscleGroup: 'Side delts',
							setType: 'straight',
							repRangeStart: 10,
							repRangeEnd: 20,
							involvesBodyweight: false
						}
					]
				},
				{
					name: 'Legs B',
					exerciseTemplates: [
						{
							name: 'Leg press',
							sets: 3,
							targetMuscleGroup: 'Quads',
							setType: 'down',
							repRangeStart: 5,
							repRangeEnd: 10,
							involvesBodyweight: false
						},
						{
							name: 'Lunges',
							sets: 2,
							targetMuscleGroup: 'Quads',
							setType: 'straight',
							repRangeStart: 15,
							repRangeEnd: 20,
							involvesBodyweight: false
						},
						{
							name: 'Good mornings',
							sets: 2,
							targetMuscleGroup: 'Hamstrings',
							setType: 'straight',
							repRangeStart: 10,
							repRangeEnd: 20,
							involvesBodyweight: false
						},
						{
							name: 'Single legged calf raises',
							sets: 3,
							targetMuscleGroup: 'Calves',
							setType: 'straight',
							repRangeStart: 10,
							repRangeEnd: 15,
							involvesBodyweight: true
						}
					]
				},
				null
			]
		}
	}
];
