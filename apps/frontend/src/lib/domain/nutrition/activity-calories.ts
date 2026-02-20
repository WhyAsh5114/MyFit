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

	let weightInKg = bodyweight;
	if (bodyweightUnit === 'lb') {
		weightInKg = bodyweight * 0.453592;
	}
	let heightInCm = height;
	if (heightUnit === 'in') {
		heightInCm = height * 2.54;
	}

	// ACSM Equation: Gold standard for walking energy expenditure
	// Estimate stride length from height (typical ratio is ~0.43 × height in cm)
	const strideLength = heightInCm * 0.43; // in cm
	const distanceWalkedCm = stepCount * strideLength;
	const distanceWalkedM = distanceWalkedCm / 100;

	// Assume typical walking session of 1 hour (3600 seconds)
	// This provides a reasonable baseline; can be adjusted if actual time is known
	const timeInMinutes = 60;
	const speedMetersPerMin = distanceWalkedM / timeInMinutes;

	// ACSM Walking Equation (level ground):
	// VO2 (ml/kg/min) = 0.1 × speed(m/min) + 1.8 × speed(m/min) × grade + 3.5
	// For level walking, grade = 0, so:
	// VO2 = 0.1 × speed + 3.5
	const vo2PerKg = 0.1 * speedMetersPerMin + 3.5;

	// Convert VO2 to energy expenditure
	// Energy (kcal) = VO2 (ml/kg/min) × weight (kg) × time (min) / 200
	// The 200 is a conversion factor (1 liter O2 ≈ 5 kcal, 1000 ml per liter)
	const caloriesBurned = (vo2PerKg * weightInKg * timeInMinutes) / 200;

	return caloriesBurned;
}
