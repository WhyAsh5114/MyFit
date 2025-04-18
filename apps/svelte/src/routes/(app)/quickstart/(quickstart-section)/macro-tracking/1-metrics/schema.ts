import { z } from 'zod';

export const formSchema = z.object({
	bodyweight: z.number().min(0, 'Bodyweight must be a positive number'),
	bodyweightUnit: z.enum(['kg', 'lb']),
	height: z.number().min(0, 'Height must be a positive number'),
	heightUnit: z.string(),
	gender: z.enum(['Male', 'Female']),
	age: z.number().min(0, 'Age must be a positive number')
});

export type FormSchema = typeof formSchema;
