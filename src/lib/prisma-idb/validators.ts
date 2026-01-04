import { z } from 'zod';

export const validators = {
	ExerciseSplit: z.strictObject({
		id: z.string(),
		name: z.string(),
		userId: z.string()
	}),
	ExerciseSplitDay: z.strictObject({
		id: z.string(),
		dayIndex: z.number().int(),
		exerciseSplitId: z.string()
	}),
	ExerciseSplitDaySession: z.strictObject({
		id: z.string(),
		name: z.string(),
		sessionIndex: z.number().int(),
		exerciseSplitDayId: z.string()
	}),
	ExerciseSplitDaySessionExercise: z.strictObject({
		id: z.string(),
		exerciseIndex: z.number().int(),
		name: z.string(),
		primaryMuscleGroup: z.string(),
		repRangeStart: z.number().int(),
		repRangeEnd: z.number().int(),
		setType: z.enum([
			'Default',
			'Straight',
			'Down',
			'Myorep',
			'MyorepMatch',
			'MyorepMatchDown',
			'Drop'
		]),
		exerciseSplitDaySessionId: z.string()
	}),
	ExerciseSplitDaySessionExerciseNote: z.strictObject({
		id: z.string(),
		exerciseId: z.string(),
		note: z.string(),
		noteIndex: z.number().int()
	}),
	ExerciseSplitDaySessionExerciseSecondaryMuscleGroup: z.strictObject({
		id: z.string(),
		exerciseId: z.string(),
		muscleGroup: z.string()
	}),
	MacroTargets: z.strictObject({
		id: z.string(),
		createdAt: z.date(),
		proteins: z.number().nullable(),
		carbs: z.number().nullable(),
		fats: z.number().nullable(),
		quantifier: z.enum(['Percentage', 'Absolute']),
		caloricChange: z.number().int(),
		userId: z.string()
	}),
	MacroMetrics: z.strictObject({
		id: z.string(),
		createdAt: z.date(),
		bodyweight: z.number(),
		bodyweightUnit: z.enum(['kg', 'lb']),
		height: z.number(),
		heightUnit: z.enum(['cm', 'in']),
		bodyFatPercentage: z.number(),
		age: z.number().int(),
		gender: z.enum(['Male', 'Female']),
		userId: z.string()
	}),
	MacroActivityTrackingPreferences: z.strictObject({
		id: z.string(),
		userId: z.string(),
		adjustmentType: z.enum(['Static', 'Dynamic', 'Manual']),
		staticCalories: z.number().int().nullable()
	}),
	FoodEntry: z.strictObject({
		id: z.string(),
		eatenAt: z.date(),
		quantity: z.number(),
		quantityUnit: z.string(),
		nutritionDataId: z.number().int().nullable(),
		userId: z.string()
	}),
	ActivityEntry: z.strictObject({
		id: z.string(),
		performedAt: z.date(),
		calories: z.number().int(),
		quantity: z.number().int(),
		quantityUnit: z.string(),
		systemGenerated: z.boolean(),
		userId: z.string()
	}),
	NutritionData: z.strictObject({
		id: z.number().int(),
		code: z.string(),
		product_name: z.string(),
		brands: z.string().nullable(),
		energy_kcal_100g: z.number(),
		proteins_100g: z.number(),
		fat_100g: z.number(),
		carbohydrates_100g: z.number(),
		saturated_fat_100g: z.number().nullable(),
		unsaturated_fat_100g: z.number().nullable(),
		monounsaturated_fat_100g: z.number().nullable(),
		polyunsaturated_fat_100g: z.number().nullable(),
		trans_fat_100g: z.number().nullable(),
		cholesterol_100g: z.number().nullable(),
		sugars_100g: z.number().nullable(),
		polyols_100g: z.number().nullable(),
		fiber_100g: z.number().nullable(),
		salt_100g: z.number().nullable(),
		sodium_100g: z.number().nullable(),
		alcohol_100g: z.number().nullable(),
		vitamin_a_100g: z.number().nullable(),
		vitamin_d_100g: z.number().nullable(),
		vitamin_e_100g: z.number().nullable(),
		vitamin_k_100g: z.number().nullable(),
		vitamin_c_100g: z.number().nullable(),
		vitamin_b1_100g: z.number().nullable(),
		vitamin_b2_100g: z.number().nullable(),
		vitamin_b6_100g: z.number().nullable(),
		vitamin_b9_100g: z.number().nullable(),
		folates_100g: z.number().nullable(),
		vitamin_b12_100g: z.number().nullable(),
		potassium_100g: z.number().nullable(),
		calcium_100g: z.number().nullable(),
		phosphorus_100g: z.number().nullable(),
		iron_100g: z.number().nullable(),
		magnesium_100g: z.number().nullable(),
		zinc_100g: z.number().nullable(),
		copper_100g: z.number().nullable(),
		manganese_100g: z.number().nullable(),
		caffeine_100g: z.number().nullable()
	}),
	GettingStartedAnswers: z.strictObject({
		id: z.string(),
		userId: z.string(),
		fitnessKnowledge: z.enum(['newbie', 'beginner', 'intermediate', 'advanced']),
		myFitPrimaryUsage: z.enum(['workoutTracking', 'macroTracking', 'socialNetwork', 'mix'])
	}),
	DashboardItem: z.strictObject({
		id: z.string(),
		userId: z.string(),
		type: z.enum(['workout', 'nutrition', 'social', 'mix']),
		createdAt: z.date()
	}),
	User: z.strictObject({
		id: z.string(),
		email: z.string(),
		name: z.string().nullable(),
		emailVerified: z.boolean(),
		image: z.string().nullable(),
		createdAt: z.date(),
		updatedAt: z.date(),
		isAnonymous: z.boolean().nullable()
	}),
	Session: z.strictObject({
		id: z.string(),
		expiresAt: z.date(),
		token: z.string(),
		createdAt: z.date(),
		updatedAt: z.date(),
		ipAddress: z.string().nullable(),
		userAgent: z.string().nullable(),
		userId: z.string()
	}),
	Account: z.strictObject({
		id: z.string(),
		accountId: z.string(),
		providerId: z.string(),
		userId: z.string(),
		accessToken: z.string().nullable(),
		refreshToken: z.string().nullable(),
		idToken: z.string().nullable(),
		accessTokenExpiresAt: z.date().nullable(),
		refreshTokenExpiresAt: z.date().nullable(),
		scope: z.string().nullable(),
		password: z.string().nullable(),
		createdAt: z.date(),
		updatedAt: z.date()
	}),
	Verification: z.strictObject({
		id: z.string(),
		identifier: z.string(),
		value: z.string(),
		expiresAt: z.date(),
		createdAt: z.date().nullable(),
		updatedAt: z.date().nullable()
	})
} as const;

export const keyPathValidators = {
	ExerciseSplit: z.tuple([z.string()]),
	ExerciseSplitDay: z.tuple([z.string()]),
	ExerciseSplitDaySession: z.tuple([z.string()]),
	ExerciseSplitDaySessionExercise: z.tuple([z.string()]),
	ExerciseSplitDaySessionExerciseNote: z.tuple([z.string()]),
	ExerciseSplitDaySessionExerciseSecondaryMuscleGroup: z.tuple([z.string()]),
	MacroTargets: z.tuple([z.string()]),
	MacroMetrics: z.tuple([z.string()]),
	MacroActivityTrackingPreferences: z.tuple([z.string()]),
	FoodEntry: z.tuple([z.string()]),
	ActivityEntry: z.tuple([z.string()]),
	NutritionData: z.tuple([z.number()]),
	GettingStartedAnswers: z.tuple([z.string()]),
	DashboardItem: z.tuple([z.string()]),
	User: z.tuple([z.string()]),
	Session: z.tuple([z.string()]),
	Account: z.tuple([z.string()]),
	Verification: z.tuple([z.string()])
} as const;
