import { CALORIES_PER_KILOGRAM } from './constants';

export type GoalDirection = 'cut' | 'maintain' | 'bulk';

export type NutritionStatus =
	/** Nothing certain to report yet, or nothing to flag. */
	| { kind: 'neutral' }
	| { kind: 'on-target' }
	| { kind: 'off-target'; direction: 'over' | 'under'; severity: 'slight' | 'far' };

/** A weekly balance within about ±0.1 kg of zero counts as maintaining. */
const MAINTAIN_BAND_KCAL = CALORIES_PER_KILOGRAM * 0.1;

/** Which way the goal pushes, from the weekly calorie balance on the targets. */
export function goalDirection(weeklyCaloricChange: number): GoalDirection {
	if (Math.abs(weeklyCaloricChange) < MAINTAIN_BAND_KCAL) return 'maintain';
	return weeklyCaloricChange < 0 ? 'cut' : 'bulk';
}

type CalorieStatusArgs = {
	consumed: number;
	/** The calories allowed for the day, including any burned. */
	target: number;
	goal: GoalDirection;
	/** A finished day is judged. A day in progress only reports what is already certain. */
	finished: boolean;
};

const off = (
	direction: 'over' | 'under',
	severity: 'slight' | 'far'
): Extract<NutritionStatus, { kind: 'off-target' }> => ({
	kind: 'off-target',
	direction,
	severity
});

/**
 * Judge calories against the target. Starting bands, to tune with real use:
 * cut is on target up to 102%, maintain within ±7%, bulk between 95% and 115%.
 */
export function calorieStatus({
	consumed,
	target,
	goal,
	finished
}: CalorieStatusArgs): NutritionStatus {
	if (target <= 0) return { kind: 'neutral' };
	const ratio = consumed / target;

	if (!finished) {
		// Being under at midday is normal. Only going over a limit is certain.
		if (goal === 'bulk') return ratio > 1.15 ? off('over', 'slight') : { kind: 'neutral' };
		if (ratio > 1) return off('over', ratio > 1.1 ? 'far' : 'slight');
		return { kind: 'neutral' };
	}

	switch (goal) {
		case 'cut':
			if (ratio < 0.8) return off('under', 'slight');
			if (ratio <= 1.02) return { kind: 'on-target' };
			return off('over', ratio <= 1.1 ? 'slight' : 'far');
		case 'maintain': {
			const gap = Math.abs(ratio - 1);
			if (gap <= 0.07) return { kind: 'on-target' };
			return off(ratio > 1 ? 'over' : 'under', gap <= 0.15 ? 'slight' : 'far');
		}
		case 'bulk':
			if (ratio < 0.8) return off('under', 'far');
			if (ratio < 0.95) return off('under', 'slight');
			if (ratio <= 1.15) return { kind: 'on-target' };
			return off('over', 'slight');
	}
}
