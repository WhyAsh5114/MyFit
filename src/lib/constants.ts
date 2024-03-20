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
				name: 'Front raise',
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
