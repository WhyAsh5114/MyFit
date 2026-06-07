import type { InferUITools } from 'ai';
import { requiredNutrientsShape, optionalNutrientsShape } from '@myfit/shared/nutrition';
import z from 'zod';

export const tools = {
	requireClarification: {
		description: 'Ask the user a clarifying question with multiple choice answers.',
		inputSchema: z.object({
			message: z.string().describe('The clarifying question to ask the user.'),
			choices: z
				.array(z.string())
				.describe('The multiple choice options for the user to pick from.')
		})
	},
	createFoodEntry: {
		description: 'Create a food entry for the user.',
		inputSchema: z.object({
			name: z.string().describe('The name of the food.'),
			quantityG: z.number().positive().describe('Amount eaten in grams.'),
			mealId: z.string().optional().describe('The meal to add this entry to.'),
			...requiredNutrientsShape,
			...optionalNutrientsShape
		})
	}
};

export type MyUITools = InferUITools<typeof tools>;
