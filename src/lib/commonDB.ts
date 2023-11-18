export function calculateTotalDuration(progression: RIRProgressionData[]) {
	let totalDuration = 0;
	progression.forEach(({ cycles }) => {
		totalDuration += cycles;
	});
	return totalDuration;
}
