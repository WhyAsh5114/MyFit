import { getRIRForWeek, progressiveOverloadMagic } from '../../src/lib/utils/workoutUtils';
import { test, expect } from '../fixtures';
import { testMesocycle } from './data';

test('progress first cycle, no changes', () => {
	const currentRIR = getRIRForWeek(testMesocycle.RIRProgression, 1);

	for (let i = 0; i < testMesocycle.mesocycleExerciseSplitDays.length; i++) {
		const output = progressiveOverloadMagic(testMesocycle, 1, 100, i);

		// Check correct RIR
		output.forEach((exercise) => {
			const lastSetToFailure = exercise.lastSetToFailure ?? testMesocycle.lastSetToFailure;
			exercise.sets.forEach((set, idx) => {
				if (idx === exercise.sets.length - 1 && lastSetToFailure) {
					expect(set.RIR).toEqual(0);
					return;
				}
				expect(set.RIR).toEqual(currentRIR);
			});
		});

		const exercisesWithoutSets = testMesocycle.mesocycleExerciseSplitDays[i].mesocycleSplitDayExercises.map(
			(exercise) => {
				const { id, mesocycleExerciseSplitDayId, sets, ...rest } = exercise;
				return rest;
			}
		);
		const outputWithoutSets = output.map((exercise) => {
			const { sets, ...rest } = exercise;
			return rest;
		});

		// Make sure all values are correct
		expect(exercisesWithoutSets).toStrictEqual(outputWithoutSets);
	}
});
