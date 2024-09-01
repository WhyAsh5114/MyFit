import type { FullExerciseSplitWithoutIdsOrIndex } from '../../routes/exercise-splits/manage/exerciseSplitRunes.svelte';

// TODO: add more templates
export const exerciseSplitTemplates: {
	description: string;
	exerciseSplit: FullExerciseSplitWithoutIdsOrIndex;
}[] = [
	{
		description: 'A weekly PPL split with 4 exercises each day, and 2x frequency for most muscle groups',
		exerciseSplit: {
			name: 'Pull Push Legs',
			exerciseSplitDays: [
				{
					name: 'Pull A',
					isRestDay: false,
					exercises: [
						{
							name: 'Pull-ups',
							targetMuscleGroup: 'Lats',
							customMuscleGroup: null,
							bodyweightFraction: 1,
							setType: 'Straight',
							repRangeStart: 5,
							repRangeEnd: 15,
							changeType: null,
							changeAmount: null,
							note: null
						},
						{
							name: 'Barbell rows',
							targetMuscleGroup: 'Traps',
							customMuscleGroup: null,
							bodyweightFraction: null,
							setType: 'Straight',
							repRangeStart: 10,
							repRangeEnd: 15,
							changeType: null,
							changeAmount: null,
							note: null
						},
						{
							name: 'Dumbbell bicep curls',
							targetMuscleGroup: 'Biceps',
							customMuscleGroup: null,
							bodyweightFraction: null,
							setType: 'Straight',
							repRangeStart: 10,
							repRangeEnd: 20,
							changeType: null,
							changeAmount: null,
							note: null
						},
						{
							name: 'Face pulls',
							targetMuscleGroup: 'RearDelts',
							customMuscleGroup: null,
							bodyweightFraction: null,
							setType: 'Straight',
							repRangeStart: 15,
							repRangeEnd: 30,
							changeType: null,
							changeAmount: null,
							note: null
						}
					]
				},
				{
					name: 'Push A',
					isRestDay: false,
					exercises: [
						{
							name: 'Incline barbell press',
							targetMuscleGroup: 'Chest',
							customMuscleGroup: null,
							bodyweightFraction: null,
							setType: 'Down',
							repRangeStart: 5,
							repRangeEnd: 10,
							changeType: 'Percentage',
							changeAmount: 5,
							note: null
						},
						{
							name: 'Overhead cable extensions',
							targetMuscleGroup: 'Triceps',
							customMuscleGroup: null,
							bodyweightFraction: null,
							setType: 'Straight',
							repRangeStart: 10,
							repRangeEnd: 20,
							changeType: null,
							changeAmount: null,
							note: null
						},
						{
							name: 'Dumbell lateral raises',
							targetMuscleGroup: 'SideDelts',
							customMuscleGroup: null,
							bodyweightFraction: null,
							setType: 'Straight',
							repRangeStart: 15,
							repRangeEnd: 30,
							changeType: null,
							changeAmount: null,
							note: null
						},
						{
							name: 'Cable lateral raises',
							targetMuscleGroup: 'SideDelts',
							customMuscleGroup: null,
							bodyweightFraction: null,
							setType: 'Straight',
							repRangeStart: 10,
							repRangeEnd: 20,
							changeType: null,
							changeAmount: null,
							note: null
						}
					]
				},
				{
					name: 'Legs A',
					isRestDay: false,
					exercises: [
						{
							name: 'Barbell good mornings',
							targetMuscleGroup: 'Hamstrings',
							customMuscleGroup: null,
							bodyweightFraction: null,
							setType: 'Straight',
							repRangeStart: 10,
							repRangeEnd: 20,
							changeType: null,
							changeAmount: null,
							note: null
						},
						{
							name: 'Barbell squats',
							targetMuscleGroup: 'Quads',
							customMuscleGroup: null,
							bodyweightFraction: 1,
							setType: 'Down',
							repRangeStart: 5,
							repRangeEnd: 10,
							changeType: 'AbsoluteLoad',
							changeAmount: 10,
							note: null
						},
						{
							name: 'Leg extensions',
							targetMuscleGroup: 'Quads',
							customMuscleGroup: null,
							bodyweightFraction: null,
							setType: 'Straight',
							repRangeStart: 10,
							repRangeEnd: 20,
							changeType: null,
							changeAmount: null,
							note: null
						},
						{
							name: 'Calf raises',
							targetMuscleGroup: 'Calves',
							customMuscleGroup: null,
							bodyweightFraction: 1,
							setType: 'Straight',
							repRangeStart: 10,
							repRangeEnd: 20,
							changeType: null,
							changeAmount: null,
							note: null
						}
					]
				},
				{
					name: 'Pull B',
					isRestDay: false,
					exercises: [
						{
							name: 'Lat pulldowns',
							targetMuscleGroup: 'Lats',
							customMuscleGroup: null,
							bodyweightFraction: null,
							setType: 'Straight',
							repRangeStart: 10,
							repRangeEnd: 20,
							changeType: null,
							changeAmount: null,
							note: null
						},
						{
							name: 'Machine rows',
							targetMuscleGroup: 'Traps',
							customMuscleGroup: null,
							bodyweightFraction: null,
							setType: 'Straight',
							repRangeStart: 10,
							repRangeEnd: 20,
							changeType: null,
							changeAmount: null,
							note: null
						},
						{
							name: 'Dumbbell hammer curls',
							targetMuscleGroup: 'Biceps',
							customMuscleGroup: null,
							bodyweightFraction: null,
							setType: 'Straight',
							repRangeStart: 10,
							repRangeEnd: 15,
							changeType: null,
							changeAmount: null,
							note: null
						},
						{
							name: 'Reverse pec flye',
							targetMuscleGroup: 'RearDelts',
							customMuscleGroup: null,
							bodyweightFraction: null,
							setType: 'Straight',
							repRangeStart: 15,
							repRangeEnd: 30,
							changeType: null,
							changeAmount: null,
							note: null
						}
					]
				},
				{
					name: 'Push B',
					isRestDay: false,
					exercises: [
						{
							name: 'Incline dumbbell press',
							targetMuscleGroup: 'Chest',
							customMuscleGroup: null,
							bodyweightFraction: null,
							setType: 'Straight',
							repRangeStart: 10,
							repRangeEnd: 15,
							changeType: null,
							changeAmount: null,
							note: null
						},
						{
							name: 'Overhead barbell extensions',
							targetMuscleGroup: 'Triceps',
							customMuscleGroup: null,
							bodyweightFraction: null,
							setType: 'Straight',
							repRangeStart: 10,
							repRangeEnd: 20,
							changeType: null,
							changeAmount: null,
							note: null
						},
						{
							name: 'Machine lateral raises',
							targetMuscleGroup: 'SideDelts',
							customMuscleGroup: null,
							bodyweightFraction: null,
							setType: 'Straight',
							repRangeStart: 15,
							repRangeEnd: 30,
							changeType: null,
							changeAmount: null,
							note: null
						},
						{
							name: 'Cable lateral raises',
							targetMuscleGroup: 'SideDelts',
							customMuscleGroup: null,
							bodyweightFraction: null,
							setType: 'Straight',
							repRangeStart: 10,
							repRangeEnd: 20,
							changeType: null,
							changeAmount: null,
							note: 'Behind the back'
						}
					]
				},
				{
					name: 'Legs B',
					isRestDay: false,
					exercises: [
						{
							name: 'Leg curls',
							targetMuscleGroup: 'Hamstrings',
							customMuscleGroup: null,
							bodyweightFraction: null,
							setType: 'Straight',
							repRangeStart: 10,
							repRangeEnd: 20,
							changeType: null,
							changeAmount: null,
							note: null
						},
						{
							name: 'Leg press',
							targetMuscleGroup: 'Quads',
							customMuscleGroup: null,
							bodyweightFraction: null,
							setType: 'Straight',
							repRangeStart: 10,
							repRangeEnd: 20,
							changeType: null,
							changeAmount: null,
							note: null
						},
						{
							name: 'Lunges',
							targetMuscleGroup: 'Quads',
							customMuscleGroup: null,
							bodyweightFraction: 0.85,
							setType: 'Straight',
							repRangeStart: 10,
							repRangeEnd: 15,
							changeType: null,
							changeAmount: null,
							note: null
						},
						{
							name: 'Calf raises',
							targetMuscleGroup: 'Calves',
							customMuscleGroup: null,
							bodyweightFraction: 1,
							setType: 'Straight',
							repRangeStart: 10,
							repRangeEnd: 20,
							changeType: null,
							changeAmount: null,
							note: null
						}
					]
				},
				{
					name: '',
					isRestDay: true,
					exercises: []
				}
			]
		}
	}
];
