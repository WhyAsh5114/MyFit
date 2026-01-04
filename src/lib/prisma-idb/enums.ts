// Auto-generated enum exports from Prisma schema

export const FitnessKnowledge = {
	newbie: 'newbie',
	beginner: 'beginner',
	intermediate: 'intermediate',
	advanced: 'advanced'
} as const;

export const MyFitPrimaryUsage = {
	workoutTracking: 'workoutTracking',
	macroTracking: 'macroTracking',
	socialNetwork: 'socialNetwork',
	mix: 'mix'
} as const;

export const DashboardWidgetType = {
	workout: 'workout',
	nutrition: 'nutrition',
	social: 'social',
	mix: 'mix'
} as const;

export const SetType = {
	Default: 'Default',
	Straight: 'Straight',
	Down: 'Down',
	Myorep: 'Myorep',
	MyorepMatch: 'MyorepMatch',
	MyorepMatchDown: 'MyorepMatchDown',
	Drop: 'Drop'
} as const;

export const ActivityAdjustmentType = {
	Static: 'Static',
	Dynamic: 'Dynamic',
	Manual: 'Manual'
} as const;

export const MacroTargetQuantifier = {
	Percentage: 'Percentage',
	Absolute: 'Absolute'
} as const;

export const Gender = {
	Male: 'Male',
	Female: 'Female'
} as const;

export const WeightUnit = {
	kg: 'kg',
	lb: 'lb'
} as const;

export const HeightUnit = {
	cm: 'cm',
	in: 'in'
} as const;

export const ChangeOperation = {
	create: 'create',
	update: 'update',
	delete: 'delete'
} as const;
