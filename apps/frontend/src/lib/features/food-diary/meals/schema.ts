import { z } from 'zod';

export const mealFormItemSchema = z.object({
	id: z.string(),
	name: z.string().min(1)
});

export const mealsFormSchema = z.object({
	meals: z.array(mealFormItemSchema)
});

export type MealFormItemSchema = z.infer<typeof mealFormItemSchema>;
export type MealsFormSchema = z.infer<typeof mealsFormSchema>;
