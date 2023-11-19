export function calculateTotalDuration(RIRProgression: RIRProgressionData[]) {
	let totalDuration = 0;
	RIRProgression.forEach(({ cycles }) => {
		totalDuration += cycles;
	});
	return totalDuration;
}

export function getTodaysWorkout(
	workouts: string[],
	exerciseSplit: MesocycleTemplate["exerciseSplit"]
) {
	return exerciseSplit[workouts.length % exerciseSplit.length];
}
