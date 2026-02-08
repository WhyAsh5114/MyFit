import { z } from 'zod';

export const setupAccountFormSchema = z.object({
	name: z.string().min(2).max(50)
});

export type SetupAccountFormSchema = typeof setupAccountFormSchema;