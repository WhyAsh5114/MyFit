import clientPromise from '$lib/mongo/mongodb';
import { prisma } from '$lib/prisma';
import { t } from '$lib/trpc/t';
import { getShortDateFromTimestamp } from '$lib/utils';
import type {
	MesocycleDocument,
	MesocycleTemplateDocument,
	MuscleGroup as V2MuscleGroup,
	WorkoutDocument
} from '$lib/V2/types';
import type { MuscleGroup } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import cuid from 'cuid';

function toPascalCase(text: V2MuscleGroup) {
	return text
		.toLowerCase()
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join('') as MuscleGroup;
}

async function getPrismaAndMongoUser(userId: string) {
	const prismaUser = await prisma.user.findUnique({
		where: { id: userId },
		select: { email: true, accounts: { select: { providerAccountId: true } } }
	});
	if (!prismaUser) {
		throw new TRPCError({ message: 'User not found in current database', code: 'BAD_REQUEST' });
	}

	const client = await clientPromise;
	const mongoUser = await client.db().collection('users').findOne({ email: prismaUser?.email });
	if (!mongoUser) {
		throw new TRPCError({
			message: 'User not found in old database, did you login with the same email?',
			code: 'NOT_FOUND'
		});
	}

	const mongoAccount = await client
		.db()
		.collection('accounts')
		.findOne({ providerAccountId: { $in: prismaUser.accounts.map((account) => account.providerAccountId) } });
	if (!mongoAccount) {
		throw new TRPCError({
			message: 'Account not found in old database, did you login with the same provider (Google, GitHub)?',
			code: 'NOT_FOUND'
		});
	}

	const activeMesocycle = await client
		.db()
		.collection<MesocycleDocument>('mesocycles')
		.findOne({ userId: mongoUser._id, endTimestamp: { $exists: false } });
	if (activeMesocycle) {
		throw new TRPCError({
			message: `A mesocycle is active in your V2 account, try again after stopping/finishing it.`,
			code: 'BAD_REQUEST'
		});
	}

	return { prismaUser, mongoUser };
}

export const users = t.router({
	getEntityCounts: t.procedure.query(async ({ ctx }) => {
		const queryResult = await prisma.user.findUnique({
			where: { id: ctx.userId },
			select: { _count: { select: { exerciseSplits: true, mesocycles: true, workouts: true } } }
		});
		if (!queryResult) {
			return null;
		}

		const startedMesocycles = await prisma.mesocycle.count({
			where: { userId: ctx.userId, startDate: { not: null } }
		});

		const entityCounts = { ...queryResult._count, startedMesocycles };
		return entityCounts;
	}),

	checkV2MigrationAvailability: t.procedure.query(async ({ ctx }) => {
		try {
			const { mongoUser } = await getPrismaAndMongoUser(ctx.userId);
			const client = await clientPromise;

			const mesocycleTemplatesCount = await client
				.db()
				.collection<MesocycleTemplateDocument>('mesocycleTemplates')
				.countDocuments({ userId: mongoUser._id });

			const mesocyclesCount = await client
				.db()
				.collection<MesocycleDocument>('mesocycles')
				.countDocuments({ userId: mongoUser._id });

			const workoutsCount = await client
				.db()
				.collection<WorkoutDocument>('workouts')
				.countDocuments({ userId: mongoUser._id });

			return { mesocycleTemplatesCount, mesocyclesCount, workoutsCount, emailId: mongoUser.email as string };
		} catch (error) {
			if (error instanceof TRPCError) {
				return error.message;
			}
			return 'Internal server error';
		}
	}),

	migrateFromV2: t.procedure.mutation(async ({ ctx }) => {
		const { mongoUser } = await getPrismaAndMongoUser(ctx.userId);

		const client = await clientPromise;
		const mesocycleTemplates = await client
			.db()
			.collection<MesocycleTemplateDocument>('mesocycleTemplates')
			.find({ userId: mongoUser._id })
			.toArray();

		const mesocycles = await client
			.db()
			.collection<MesocycleDocument>('mesocycles')
			.find({ userId: mongoUser._id })
			.toArray();

		const workouts = await client
			.db()
			.collection<WorkoutDocument>('workouts')
			.find({ userId: mongoUser._id })
			.toArray();

		const mesocycleTemplateIds = Array.from({ length: mesocycleTemplates.length }).map(() => cuid());
		const exerciseSplitCreate = prisma.exerciseSplit.createMany({
			data: mesocycleTemplates.map((mesocycleTemplate, idx) => ({
				name: mesocycleTemplate.name,
				id: mesocycleTemplateIds[idx],
				userId: ctx.userId
			}))
		});

		const exerciseSplitDayIds = Array.from({ length: mesocycleTemplates.length }).map((_, templateIdx) =>
			Array.from({ length: mesocycleTemplates[templateIdx].exerciseSplit.length }).map(() => cuid())
		);
		const exerciseSplitDayCreate = prisma.exerciseSplitDay.createMany({
			data: mesocycleTemplates.flatMap((mesocycleTemplate, templateIdx) =>
				mesocycleTemplate.exerciseSplit.map((splitDay, dayIndex) => {
					return {
						id: exerciseSplitDayIds[templateIdx][dayIndex],
						name: splitDay?.name ?? '',
						isRestDay: splitDay === null,
						dayIndex,
						exerciseSplitId: mesocycleTemplateIds[templateIdx]
					};
				})
			)
		});

		const exerciseTemplateIds = Array.from({ length: mesocycleTemplates.length }).map((_, templateIdx) =>
			Array.from({ length: mesocycleTemplates[templateIdx].exerciseSplit.length }).map((_, dayIndex) => {
				if (mesocycleTemplates[templateIdx].exerciseSplit[dayIndex] === null) return [];
				return Array.from({ length: mesocycleTemplates[templateIdx].exerciseSplit[dayIndex].exercises.length }).map(
					() => cuid()
				);
			})
		);
		const exerciseSplitDayTemplateCreate = prisma.exerciseTemplate.createMany({
			data: mesocycleTemplates.flatMap((mesocycleTemplate, templateIdx) =>
				mesocycleTemplate.exerciseSplit.flatMap((splitDay, dayIndex) => {
					if (!splitDay) return [];
					return splitDay.exercises.map((exercise, exerciseIndex) => {
						return {
							id: exerciseTemplateIds[templateIdx][dayIndex][exerciseIndex],
							name: exercise.name,
							exerciseIndex,
							targetMuscleGroup: toPascalCase(exercise.targetMuscleGroup),
							repRangeStart: exercise.repRangeStart,
							repRangeEnd: exercise.repRangeEnd,
							setType: 'V2',
							exerciseSplitDayId: exerciseSplitDayIds[templateIdx][dayIndex]
						};
					});
				})
			)
		});

		const mesocycleIds = Array.from({ length: mesocycles.length }).map(() => cuid());
		const mesocycleCreate = prisma.mesocycle.createMany({
			data: mesocycles.map((mesocycle, mesocycleIndex) => {
				const durationString = `(${getShortDateFromTimestamp(mesocycle.startTimestamp)} - ${getShortDateFromTimestamp(mesocycle.endTimestamp)})`;

				const templateIdx = mesocycleTemplates.findIndex(
					(mesocycleTemplate) => mesocycle.templateMesoId === mesocycleTemplate._id
				);

				return {
					id: mesocycleIds[mesocycleIndex],
					forceRIRMatching: false,
					lastSetToFailure: false,
					name:
						templateIdx !== -1
							? `${mesocycleTemplates[templateIdx].name} ${durationString}`
							: `(Deleted) ${durationString}`,
					startOverloadPercentage: 0,
					userId: ctx.userId,
					exerciseSplitId: templateIdx ? mesocycleTemplateIds[templateIdx] : null,
					RIRProgression: mesocycleTemplates[templateIdx].RIRProgression.map(({ cycles }) => cycles)
				};
			})
		});

		const mesocycleExerciseSplitDayIds = Array.from({ length: mesocycles.length }).map((_, mesocycleIdx) => {
			const template = mesocycleTemplates.find(({ _id }) => mesocycles[mesocycleIdx].templateMesoId === _id);
			if (!template) return [];
			return Array.from({ length: template.exerciseSplit.length }).map((_) => cuid());
		});
		const mesocycleExerciseSplitDayCreate = prisma.mesocycleExerciseSplitDay.createMany({
			data: mesocycles.flatMap((mesocycle, mesocycleIdx) => {
				const template = mesocycleTemplates.find(({ _id }) => mesocycle.templateMesoId === _id);
				if (!template) return [];

				return template.exerciseSplit.map((splitDay, dayIndex) => {
					return {
						id: mesocycleExerciseSplitDayIds[mesocycleIdx][dayIndex],
						name: splitDay?.name ?? '',
						isRestDay: splitDay === null,
						dayIndex,
						mesocycleId: mesocycleIds[mesocycleIdx]
					};
				});
			})
		});

		const mesocycleExerciseTemplateIds = Array.from({ length: mesocycles.length }).map((_, mesocycleIdx) => {
			const template = mesocycleTemplates.find(({ _id }) => mesocycles[mesocycleIdx].templateMesoId === _id);
			if (!template) return [];
			return Array.from({ length: template.exerciseSplit.length }).map((_, dayIndex) => {
				const splitDay = template.exerciseSplit[dayIndex];
				if (!splitDay) return [];
				return Array.from({ length: splitDay.exercises.length }).map(() => cuid());
			});
		});
		const mesocycleExerciseTemplateCreate = prisma.mesocycleExerciseTemplate.createMany({
			data: mesocycles.flatMap((_, mesocycleIdx) => {
				const template = mesocycleTemplates.find(({ _id }) => mesocycles[mesocycleIdx].templateMesoId === _id);
				if (!template) return [];

				return template.exerciseSplit.flatMap((splitDay, dayIndex) => {
					if (!splitDay) return [];

					return splitDay.exercises.map((exercise, exerciseIndex) => {
						return {
							id: mesocycleExerciseTemplateIds[mesocycleIdx][dayIndex][exerciseIndex],
							name: exercise.name,
							exerciseIndex,
							targetMuscleGroup: toPascalCase(exercise.targetMuscleGroup),
							repRangeStart: exercise.repRangeStart,
							repRangeEnd: exercise.repRangeEnd,
							setType: 'V2',
							sets: exercise.sets,
							mesocycleExerciseSplitDayId: mesocycleExerciseSplitDayIds[mesocycleIdx][dayIndex]
						};
					});
				});
			})
		});

		const workoutIds = Array.from({ length: workouts.length }).map(() => cuid());
		

		await prisma.$transaction([
			exerciseSplitCreate,
			exerciseSplitDayCreate,
			exerciseSplitDayTemplateCreate,
			mesocycleCreate,
			mesocycleExerciseSplitDayCreate,
			mesocycleExerciseTemplateCreate
		]);
	})
});
