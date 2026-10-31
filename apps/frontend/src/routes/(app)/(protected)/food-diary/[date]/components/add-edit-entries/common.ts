export function hasCalculationErrors(
	energyKcal: number,
	carbsG: number,
	proteinG: number,
	fatG: number
) {
	const totalEnergyFromMacros = carbsG * 4 + proteinG * 4 + fatG * 9;
	const energyDifference = Math.abs(energyKcal - totalEnergyFromMacros);

	// Allow a small margin of error (10 kcal or 10% of the total energy) to account for rounding issues
	return energyDifference > Math.max(10, energyKcal * 0.1);
}
