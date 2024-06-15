import type { MuscleGroup } from '@prisma/client';
import type { ExerciseTemplateWithoutIDs } from './types';

// TODO: extend this list
export const commonExercisePerMuscleGroup: {
	muscleGroup: MuscleGroup;
	exercises: ExerciseTemplateWithoutIDs[];
}[] = [
	{
		muscleGroup: 'Chest',
		exercises: [
			{
				name: 'Barbell bench press',
				targetMuscleGroup: 'Chest',
				customMuscleGroup: null,
				involvesBodyweight: false,
				setType: 'Down',
				repRangeStart: 5,
				repRangeEnd: 10,
				changeType: 'AbsoluteLoad',
				changeAmount: 5,
				note: null
			},
			{
				name: 'Incline dumbbell press',
				targetMuscleGroup: 'Chest',
				customMuscleGroup: null,
				involvesBodyweight: false,
				setType: 'Straight',
				repRangeStart: 10,
				repRangeEnd: 15,
				changeType: null,
				changeAmount: null,
				note: null
			},
			{
				name: 'Machine chest flyes',
				targetMuscleGroup: 'Chest',
				customMuscleGroup: null,
				involvesBodyweight: false,
				setType: 'Straight',
				repRangeStart: 15,
				repRangeEnd: 20,
				changeType: null,
				changeAmount: null,
				note: null
			},
			{
				name: 'Push-ups',
				targetMuscleGroup: 'Chest',
				customMuscleGroup: null,
				involvesBodyweight: true,
				setType: 'Straight',
				repRangeStart: 5,
				repRangeEnd: 20,
				changeType: null,
				changeAmount: null,
				note: null
			}
		]
	},
	{
		muscleGroup: 'Biceps',
		exercises: [
			{
				name: 'Dumbbell bicep curls',
				targetMuscleGroup: 'Biceps',
				customMuscleGroup: null,
				involvesBodyweight: false,
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
				involvesBodyweight: false,
				setType: 'Straight',
				repRangeStart: 10,
				repRangeEnd: 15,
				changeType: null,
				changeAmount: null,
				note: null
			},
			{
				name: 'Concentration curls',
				targetMuscleGroup: 'Biceps',
				customMuscleGroup: null,
				involvesBodyweight: false,
				setType: 'Straight',
				repRangeStart: 10,
				repRangeEnd: 20,
				changeType: null,
				changeAmount: null,
				note: null
			},
			{
				name: 'Preacher curls',
				targetMuscleGroup: 'Biceps',
				customMuscleGroup: null,
				involvesBodyweight: false,
				setType: 'Down',
				repRangeStart: 10,
				repRangeEnd: 20,
				changeType: 'AbsoluteLoad',
				changeAmount: 2.5,
				note: null
			}
		]
	},
	{
		muscleGroup: 'Quads',
		exercises: [
			{
				name: 'Barbell squats',
				targetMuscleGroup: 'Quads',
				customMuscleGroup: null,
				involvesBodyweight: true,
				setType: 'Down',
				repRangeStart: 5,
				repRangeEnd: 10,
				changeType: 'AbsoluteLoad',
				changeAmount: 10,
				note: null
			},
			{
				name: 'Leg press',
				targetMuscleGroup: 'Quads',
				customMuscleGroup: null,
				involvesBodyweight: false,
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
				involvesBodyweight: true,
				setType: 'Straight',
				repRangeStart: 10,
				repRangeEnd: 15,
				changeType: null,
				changeAmount: null,
				note: null
			},
			{
				name: 'Leg extensions',
				targetMuscleGroup: 'Quads',
				customMuscleGroup: null,
				involvesBodyweight: false,
				setType: 'Straight',
				repRangeStart: 10,
				repRangeEnd: 20,
				changeType: null,
				changeAmount: null,
				note: null
			}
		]
	}
];
