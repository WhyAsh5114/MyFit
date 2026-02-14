type CalculateBMRArgs = {
  bodyweight: number;
  bodyweightUnit: 'kg' | 'lb';
  height: number;
  heightUnit: 'cm' | 'in';
  age: number;
  bodyFatPercentage: number;
  gender: 'Male' | 'Female';
}

export function calculateBMR(data: CalculateBMRArgs) {
	const { bodyweight, bodyweightUnit, height, heightUnit, age, bodyFatPercentage, gender } = data;

	let weightInKg = bodyweight;
	if (bodyweightUnit === 'lb') {
		weightInKg = bodyweight * 0.453592;
	}
	let heightInCm = height;
	if (heightUnit === 'in') {
		heightInCm = height * 2.54;
	}
	if (gender === 'Male') {
		return (
			88.362 + 13.397 * weightInKg + 4.799 * heightInCm - 5.677 * age - 6.8 * bodyFatPercentage
		);
	} else {
		return 447.593 + 9.247 * weightInKg + 3.098 * heightInCm - 4.33 * age - 4.7 * bodyFatPercentage;
	}
}
