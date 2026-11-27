import { expect, test } from '@playwright/test';
import { buildDraftFromSelection } from '../../src/lib/components/mesocycleAndExerciseSplit/exerciseSelection';

const defaults: Record<string, unknown> = { name: '', setType: 'Straight', bodyweightFraction: null };

test('keeps the default set type when the selected exercise comes from workout history', () => {
	const historyExercise = { name: 'Machine pulldown', targetMuscleGroup: 'Lats', customMuscleGroup: null };

	const draft = buildDraftFromSelection(defaults, historyExercise);

	expect(draft).toEqual({
		name: 'Machine pulldown',
		setType: 'Straight',
		bodyweightFraction: null,
		targetMuscleGroup: 'Lats',
		customMuscleGroup: null
	});
});

test("uses the selected exercise's own values over the defaults", () => {
	const libraryExercise = { name: 'Barbell bench press', setType: 'Down', bodyweightFraction: 0.5 };

	const draft = buildDraftFromSelection(defaults, libraryExercise);

	expect(draft).toMatchObject({ name: 'Barbell bench press', setType: 'Down', bodyweightFraction: 0.5 });
});

test('applies extra props last and does not share references with the inputs', () => {
	const selected = { name: 'Cable row', notes: ['a'] };

	const draft = buildDraftFromSelection(defaults, selected, { sets: undefined, overloadPercentage: null });

	expect(draft).toMatchObject({ setType: 'Straight', overloadPercentage: null });
	expect(draft.notes).not.toBe(selected.notes);
});
