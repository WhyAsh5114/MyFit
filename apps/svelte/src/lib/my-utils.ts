import type { MacroMetrics } from '@prisma/client';

export function kebabToCamel(str: string) {
	return str.replace(/-([a-z])/g, (m, w) => w.toUpperCase());
}

export function kebabToNormal(str: string) {
	return str.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

export function pascalToNormal(str: string) {
	return str.replace(/([A-Z])/g, ' $1').replace(/^\w/, (c) => c.toUpperCase());
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
