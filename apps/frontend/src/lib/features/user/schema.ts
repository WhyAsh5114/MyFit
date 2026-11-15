import { z } from 'zod';
import { m } from '#lib/paraglide/messages.js';

const nameLength = { error: () => m['validation.nameLength']() };

export const setupAccountFormSchema = z.object({
	name: z.string().min(2, nameLength).max(50, nameLength)
});

export type SetupAccountFormSchema = typeof setupAccountFormSchema;
