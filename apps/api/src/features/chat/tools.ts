import type { InferUITools } from 'ai';
import { REQUIRED_NUTRIENT_FIELDS, OPTIONAL_NUTRIENT_FIELDS } from '@myfit/shared/nutrition';
import z from 'zod';

type RequiredNutrientKey = (typeof REQUIRED_NUTRIENT_FIELDS)[number]['key'];
type OptionalNutrientKey = (typeof OPTIONAL_NUTRIENT_FIELDS)[number]['key'];

const coercedRequiredNutrientsShape = Object.fromEntries(
	REQUIRED_NUTRIENT_FIELDS.map((f) => [f.key, z.coerce.number().nonnegative()])
) as { [K in RequiredNutrientKey]: z.ZodNumber };

const coercedOptionalNutrientsShape = Object.fromEntries(
	OPTIONAL_NUTRIENT_FIELDS.map((f) => [
		f.key,
		z.coerce.number().nonnegative().optional().nullable()
	])
) as { [K in OptionalNutrientKey]: z.ZodNullable<z.ZodOptional<z.ZodNumber>> };

export const tools = {
	requireClarification: {
		description: 'Ask the user a clarifying question with multiple choice answers.',
		inputSchema: z.object({
			message: z.string().describe('The clarifying question to ask the user.'),
			choices: z
				.array(z.string())
				.describe('The multiple choice options for the user to pick from.')
		}),
		outputSchema: z.string()
	},
	createFoodEntry: {
		description: 'Create a food entry for the user.',
		inputSchema: z.object({
			name: z.string().describe('The name of the food.'),
			quantityG: z.coerce.number().positive().describe('Amount eaten in grams.'),
			...coercedRequiredNutrientsShape,
			...coercedOptionalNutrientsShape
		}),
		outputSchema: z.string()
	}
};

export type MyUITools = InferUITools<typeof tools>;
