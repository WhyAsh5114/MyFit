type CalculateActivityCaloriesArgs = {
	bodyweight: number;
	bodyweightUnit: 'kg' | 'lb';
	height: number;
	heightUnit: 'cm' | 'in';
	stepCount: number;
};

export function calculateActivityCalories(data: CalculateActivityCaloriesArgs) {
	const {
		bodyweight,
		bodyweightUnit,
		height,
		heightUnit,
		stepCount
	} = data;

	if (stepCount <= 0) return 0;

	// Convert bodyweight to kg if needed
	const bodyweightInKg =
		bodyweightUnit === 'kg'
			? bodyweight
			: bodyweight * 0.453592; // lb to kg conversion

	// Convert height to cm if needed
	const heightInCm =
		heightUnit === 'cm'
			? height
			: height * 2.54; // inches to cm conversion

	// Calculate stride length based on height (rough estimation)
	// Formula: stride length (cm) = height (cm) * 0.43
	const strideLengthCm = heightInCm * 0.43;

	// Calculate distance in km
	const distanceKm = (stepCount * strideLengthCm) / 100000; // cm to km

	// Base MET (Metabolic Equivalent) value for walking at moderate pace (~3.5 mph)
	const baseMET = 3.5;

	// Calculate calories using: calories = MET * weight(kg) * time(hours)
	// Estimate time based on average walking speed of 5 km/h
	const averageWalkingSpeedKmh = 5;
	const timeHours = distanceKm / averageWalkingSpeedKmh;

	const calories = baseMET * bodyweightInKg * timeHours;

	// Return rounded calories (minimum 1 calorie for any steps > 0)
	return Math.max(1, Math.round(calories));
}
