/**
 * Client-safe Prisma enum constants derived from Zod schemas.
 *
 * Importing directly from '@prisma/client' in browser-side Svelte components creates a Vite
 * circular dependency that causes the enum module to resolve to `undefined` at runtime.
 * Use these re-exports instead.
 */
import { ChangeTypeSchema, MuscleGroupSchema, QuotesDisplayModeSchema, SetTypeSchema } from '$lib/zodSchemas';

export const MuscleGroup = MuscleGroupSchema.enum;
export type MuscleGroup = keyof typeof MuscleGroup;

export const SetType = SetTypeSchema.enum;
export type SetType = keyof typeof SetType;

export const ChangeType = ChangeTypeSchema.enum;
export type ChangeType = keyof typeof ChangeType;

export const QuotesDisplayMode = QuotesDisplayModeSchema.enum;
export type QuotesDisplayMode = keyof typeof QuotesDisplayMode;
