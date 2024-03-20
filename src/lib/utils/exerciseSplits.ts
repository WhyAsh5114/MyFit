export function getTotalNonRestDays(splitDays: ExerciseSplit['splitDays']) {
	return splitDays.reduce((nonRestDays, splitDay) => {
		return splitDay ? nonRestDays + 1 : nonRestDays;
	}, 0);
}

export function getTotalSetsOfSplitDay(splitDay: ExerciseSplitDay) {
	return splitDay.exerciseTemplates.reduce((sets, exercise) => {
		return sets + exercise.sets;
	}, 0);
}

export function getTotalSetsOfSplit(splitDays: ExerciseSplit['splitDays']) {
	return splitDays.reduce((sets, splitDay) => {
		if (splitDay) return sets + getTotalSetsOfSplitDay(splitDay);
		else return sets;
	}, 0);
}

export function getAverageSetsPerDayOfSplit(splitDays: ExerciseSplit['splitDays']) {
	return getTotalSetsOfSplit(splitDays) / getTotalNonRestDays(splitDays);
}
