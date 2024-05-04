import type {
	ExerciseSplit as ExerciseSplitModel,
	ExerciseSplitDay as ExerciseSplitDayModel
} from '@prisma/client';

export type ExerciseSplit = Omit<ExerciseSplitModel, 'id' | 'userId'>;
export type ExerciseSplitDay = Omit<ExerciseSplitDayModel, 'id' | 'exerciseSplitId'>;

export function createExerciseSplit() {
	let splitName = $state('');
	let splitDays: ExerciseSplitDay[] = $state(
		Array.from({ length: 7 }).map(() => ({ name: '', isRestDay: false }))
	);

	function addSplitDay() {
		splitDays.push({ name: '', isRestDay: false });
	}

	function removeSplitDay() {
		splitDays.pop();
	}

	function toggleSplitDay(idx: number, markAsRest: boolean) {
		if (!markAsRest) {
			splitDays[idx].isRestDay = false;
		} else {
			splitDays[idx].isRestDay = true;
			splitDays[idx].name = '';
		}
	}

	return {
		get splitName() {
			return splitName;
		},
		set splitName(name: string) {
			splitName = name;
		},
		get splitDays() {
			return splitDays;
		},
		addSplitDay,
		removeSplitDay,
		toggleSplitDay
	};
}

export const exerciseSplit = createExerciseSplit();
