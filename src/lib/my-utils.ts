import { fromDate, getLocalTimeZone } from '@internationalized/date';
import type { MacroMetrics } from '@prisma/client';
import { formatHex } from 'culori';

export function kebabToCamel(str: string) {
	return str.replace(/-([a-z])/g, (m, w) => w.toUpperCase());
}

export function kebabToNormal(str: string) {
	return str.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

export function pascalToNormal(str: string) {
	return str.replace(/([A-Z])/g, ' $1').replace(/^\w/, (c) => c.toUpperCase());
}

export function snakeToNormal(str: string) {
	return str.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

export function oklchToHex(oklchString: string): string {
	const cleaned = oklchString.replace(/oklch\(|\)/g, '').trim();
	const [l, c, h] = cleaned.split(/\s+/).map((val, index) => {
		const num = parseFloat(val);
		if (index === 0) return Math.max(0, Math.min(1, num)); // lightness
		if (index === 1) return Math.max(0, Math.min(0.4, num)); // chroma
		if (index === 2) return num % 360; // hue
		return num;
	});

	const oklchColor = { mode: 'oklch' as const, l, c, h: h || 0 };
	return formatHex(oklchColor) || '#000000';
}

export function capitalizeWords(str: string) {
	return str
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

export function calculateBMR(metrics: MacroMetrics) {
	if (metrics.gender === 'Male') {
		return (
			66.5 +
			13.75 * metrics.bodyweight +
			5.003 * metrics.height -
			6.755 * metrics.age -
			metrics.bodyFatPercentage * 0.1 * 66.5
		);
	}
	return (
		655.1 +
		9.563 * metrics.bodyweight +
		1.85 * metrics.height -
		4.676 * metrics.age -
		metrics.bodyFatPercentage * 0.1 * 655.1
	);
}

export function stepsToCalories(steps: number, userMetrics: MacroMetrics): number {
	if (steps <= 0) return 0;

	// Convert bodyweight to kg if needed
	const bodyweightInKg =
		userMetrics.bodyweightUnit === 'kg'
			? userMetrics.bodyweight
			: userMetrics.bodyweight * 0.453592; // lb to kg conversion

	// Convert height to cm if needed
	const heightInCm =
		userMetrics.heightUnit === 'cm' ? userMetrics.height : userMetrics.height * 2.54; // inches to cm conversion

	// Calculate stride length based on height (rough estimation)
	// Formula: stride length (cm) = height (cm) * 0.43
	const strideLengthCm = heightInCm * 0.43;

	// Calculate distance in km
	const distanceKm = (steps * strideLengthCm) / 100000; // cm to km

	// Base MET (Metabolic Equivalent) value for walking at moderate pace (~3.5 mph)
	// This can be adjusted based on pace, but we'll use a moderate walking pace
	const baseMET = 3.5;

	// Adjust MET based on age and gender (younger people and males typically have slightly higher metabolism)
	let adjustedMET = baseMET;

	// Age adjustment: metabolism slows with age
	if (userMetrics.age > 40) {
		adjustedMET *= 0.95;
	} else if (userMetrics.age < 25) {
		adjustedMET *= 1.05;
	}

	// Gender adjustment: males typically burn slightly more calories
	if (userMetrics.gender === 'Male') {
		adjustedMET *= 1.02;
	}

	// Body fat adjustment: lower body fat percentage typically means higher muscle mass and metabolism
	if (userMetrics.bodyFatPercentage < 15) {
		adjustedMET *= 1.05;
	} else if (userMetrics.bodyFatPercentage > 25) {
		adjustedMET *= 0.95;
	}

	// Calculate calories using: calories = MET * weight(kg) * time(hours)
	// Estimate time based on average walking speed of 5 km/h
	const averageWalkingSpeedKmh = 5;
	const timeHours = distanceKm / averageWalkingSpeedKmh;

	const calories = adjustedMET * bodyweightInKg * timeHours;

	// Return rounded calories (minimum 1 calorie for any steps > 0)
	return Math.max(1, Math.round(calories));
}

export function formatDateToISO(date: Date): string {
	const calendarDate = fromDate(date, getLocalTimeZone());
	return calendarDate.toString();
}
