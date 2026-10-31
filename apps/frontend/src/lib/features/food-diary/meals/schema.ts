import { z } from 'zod';
import { m } from '#lib/paraglide/messages.js';

export const mealFormItemSchema = z.object({
	id: z.string(),
	name: z.string().min(1)
});

export const mealsFormSchema = z
	.object({
		meals: z.array(mealFormItemSchema)
	})
	.superRefine(({ meals }, ctx) => {
		// Names are unique per user, so the second meal with a name is the one that can't be saved.
		const seen = new Set<string>();
		meals.forEach((meal, index) => {
			if (seen.has(meal.name)) {
				ctx.addIssue({
					code: 'custom',
					path: ['meals', index, 'name'],
					message: m['foodDiary.mealNameDuplicate']()
				});
			}
			seen.add(meal.name);
		});
	});

export type MealFormItemSchema = z.infer<typeof mealFormItemSchema>;
export type MealsFormSchema = z.infer<typeof mealsFormSchema>;
