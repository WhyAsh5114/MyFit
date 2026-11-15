import { z } from 'zod';
import { m } from '#lib/paraglide/messages.js';
import { EMPTY_NUMBER } from '../_common/empty-number.js';

export const macroTrackingMetricsSchema = z.object({
	bodyweight: z
		.number()
		.min(0, { error: () => m['validation.nonNegative']() })
		.default(EMPTY_NUMBER),
	bodyweightUnit: z.enum(['kg', 'lb']),
	height: z
		.number()
		.min(0, { error: () => m['validation.nonNegative']() })
		.default(EMPTY_NUMBER),
	heightUnit: z.enum(['cm', 'in']),
	gender: z.enum(['Male', 'Female']),
	age: z
		.number()
		.min(0, { error: () => m['validation.nonNegative']() })
		.default(EMPTY_NUMBER),
	bodyFatPercentage: z
		.number()
		.min(0, { error: () => m['validation.nonNegative']() })
		.max(100, { error: () => m['validation.percentMax']() })
		.default(EMPTY_NUMBER)
});

export type MacroTrackingMetricsSchema = z.infer<typeof macroTrackingMetricsSchema>;
