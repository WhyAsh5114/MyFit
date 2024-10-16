import clientPromise from '$lib/mongo/mongodb';
import { prisma } from '$lib/prisma';
import { t } from '$lib/trpc/t';
import { getShortDateFromTimestamp } from '$lib/utils';
import {
	type MesocycleDocument,
	type MesocycleTemplateDocument,
	type MuscleGroup as V2MuscleGroup,
	type WorkoutDocument
} from '$lib/V2/types';
import { createId } from '@paralleldrive/cuid2';
import type { MuscleGroup, Prisma, Workout, WorkoutExercise, WorkoutOfMesocycle } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

function toPascalCase(text: V2MuscleGroup) {
	const output = text
		.toLowerCase()
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join('');
	if (output === 'Back') return 'Lats';
	return output as MuscleGroup;
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

	migrateFromV2: t.procedure
		.input(z.strictObject({ bodyweight: z.number(), duration: z.number() }))
		.mutation(async ({ ctx, input }) => {
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

			const mesocycleTemplateIds = Array.from({ length: mesocycleTemplates.length }).map(() => createId());
			const exerciseSplitCreate = prisma.exerciseSplit.createMany({
				data: mesocycleTemplates.map((mesocycleTemplate, idx) => ({
					name: mesocycleTemplate.name,
					id: mesocycleTemplateIds[idx],
					userId: ctx.userId
				}))
			});

			const exerciseSplitDayIds = Array.from({ length: mesocycleTemplates.length }).map((_, templateIdx) =>
				Array.from({ length: mesocycleTemplates[templateIdx].exerciseSplit.length }).map(() => createId())
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
						() => createId()
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
								exerciseSplitDayId: exerciseSplitDayIds[templateIdx][dayIndex],
								bodyweightFraction: exercise.weightType === 'Bodyweight' ? 1 : null // Assumption: full bodyweight
							};
						});
					})
				)
			});

			const mesocycleIds = Array.from({ length: mesocycles.length }).map(() => createId());
			const mesocycleCreate = prisma.mesocycle.createMany({
				data: mesocycles.map((mesocycle, mesocycleIndex) => {
					const durationString = `(${getShortDateFromTimestamp(mesocycle.startTimestamp)} - ${getShortDateFromTimestamp(mesocycle.endTimestamp)})`;

					const templateIdx = mesocycleTemplates.findIndex((mesocycleTemplate) =>
						mesocycle.templateMesoId.equals(mesocycleTemplate._id)
					);

					const firstWorkout = workouts.find((workout) => workout.performedMesocycleId.equals(mesocycle._id));
					const lastWorkout = workouts
						.toReversed()
						.find((workout) => workout.performedMesocycleId.equals(mesocycle._id));

					const prismaMesocycle: Prisma.MesocycleUncheckedCreateInput = {
						id: mesocycleIds[mesocycleIndex],
						forceRIRMatching: false,
						lastSetToFailure: false,
						name: templateIdx !== -1 ? `${mesocycleTemplates[templateIdx].name}` : `(Deleted) ${durationString}`,
						startOverloadPercentage: 0,
						userId: ctx.userId,
						exerciseSplitId: templateIdx ? mesocycleTemplateIds[templateIdx] : null,
						RIRProgression: mesocycleTemplates[templateIdx].RIRProgression.map(({ cycles }) => cycles)
					};

					if (firstWorkout) {
						prismaMesocycle.startDate = new Date(firstWorkout.startTimestamp);
						prismaMesocycle.endDate = new Date(lastWorkout!.startTimestamp);
					} else {
						prismaMesocycle.startDate = new Date();
						prismaMesocycle.endDate = new Date();
					}

					return prismaMesocycle;
				})
			});

			const mesocycleExerciseSplitDayIds = Array.from({ length: mesocycles.length }).map((_, mesocycleIdx) => {
				const template = mesocycleTemplates.find(({ _id }) => mesocycles[mesocycleIdx].templateMesoId.equals(_id));
				if (!template) return [];
				return Array.from({ length: template.exerciseSplit.length }).map((_) => createId());
			});
			const mesocycleExerciseSplitDayCreate = prisma.mesocycleExerciseSplitDay.createMany({
				data: mesocycles.flatMap((mesocycle, mesocycleIdx) => {
					const template = mesocycleTemplates.find(({ _id }) => mesocycle.templateMesoId.equals(_id));
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
				const template = mesocycleTemplates.find(({ _id }) => mesocycles[mesocycleIdx].templateMesoId.equals(_id));
				if (!template) return [];
				return Array.from({ length: template.exerciseSplit.length }).map((_, dayIndex) => {
					const splitDay = template.exerciseSplit[dayIndex];
					if (!splitDay) return [];
					return Array.from({ length: splitDay.exercises.length }).map(() => createId());
				});
			});
			const mesocycleExerciseTemplateCreate = prisma.mesocycleExerciseTemplate.createMany({
				data: mesocycles.flatMap((_, mesocycleIdx) => {
					const template = mesocycleTemplates.find(({ _id }) => mesocycles[mesocycleIdx].templateMesoId.equals(_id));
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
								mesocycleExerciseSplitDayId: mesocycleExerciseSplitDayIds[mesocycleIdx][dayIndex],
								bodyweightFraction: exercise.weightType === 'Bodyweight' ? 1 : null // Assumption: full bodyweight
							};
						});
					});
				})
			});

			const workoutIds = Array.from({ length: workouts.length }).map(() => createId());
			const workoutCreate = prisma.workout.createMany({
				data: workouts.map((workout, workoutIdx) => {
					const prismaWorkout: Workout = {
						id: workoutIds[workoutIdx],
						userId: ctx.userId,
						startedAt: new Date(workout.startTimestamp),
						endedAt: new Date(workout.startTimestamp + 1000 * 60 * input.duration),
						userBodyweight: input.bodyweight // Assumption (same bodyweight applied to all workouts)
					};
					return prismaWorkout;
				})
			});

			const workoutExerciseIds = Array.from({ length: workouts.length }).map((_, workoutIdx) =>
				Array.from({ length: workouts[workoutIdx].exercisesPerformed.length }).map(() => createId())
			);
			const workoutExerciseCreate = prisma.workoutExercise.createMany({
				data: workouts.flatMap((workout, workoutIdx) =>
					workout.exercisesPerformed.map((exercise, exerciseIdx) => {
						const prismaWorkoutExercise: WorkoutExercise = {
							id: workoutExerciseIds[workoutIdx][exerciseIdx],
							bodyweightFraction: typeof exercise.bodyweight === 'number' ? 1 : null, // Assumption (full bodyweight)
							changeAmount: null,
							changeType: null,
							targetMuscleGroup: toPascalCase(exercise.targetMuscleGroup),
							name: exercise.name,
							repRangeStart: exercise.repRangeStart,
							repRangeEnd: exercise.repRangeEnd,
							exerciseIndex: exerciseIdx,
							workoutId: workoutIds[workoutIdx],
							customMuscleGroup: null,
							setType: 'V2',
							note: exercise.note ?? '',
							lastSetToFailure: null,
							forceRIRMatching: null,
							minimumWeightChange: 5,
							overloadPercentage: 0 // Assumption (concept didn't exist in V2)
						};
						return prismaWorkoutExercise;
					})
				)
			});

			const workoutExerciseSetIds = Array.from({ length: workouts.length }).map((_, workoutIdx) =>
				Array.from({ length: workouts[workoutIdx].exercisesPerformed.length }).map((_, exerciseIdx) =>
					Array.from({ length: workouts[workoutIdx].exercisesPerformed[exerciseIdx].sets.length }).map(() => createId())
				)
			);
			const workoutExerciseSetCreate = prisma.workoutExerciseSet.createMany({
				data: workouts.flatMap((workout, workoutIdx) =>
					workout.exercisesPerformed.flatMap((exercise, exerciseIdx) =>
						exercise.sets.map((set, setIdx) => {
							return {
								...set,
								id: workoutExerciseSetIds[workoutIdx][exerciseIdx][setIdx],
								setIndex: setIdx,
								skipped: false,
								workoutExerciseId: workoutExerciseIds[workoutIdx][exerciseIdx]
							};
						})
					)
				)
			});

			const workoutOfMesocycleCreate = prisma.workoutOfMesocycle.createMany({
				data: mesocycles
					.flatMap((mesocycle, mesocycleIdx) => {
						const templateMesocycle = mesocycleTemplates.find((template) =>
							template._id.equals(mesocycle.templateMesoId)
						);
						if (!templateMesocycle) return null;

						return mesocycle.workouts.map((workoutId, workoutIdx) => {
							const splitDayIndex = workoutIdx % templateMesocycle.exerciseSplit.length;
							if (!workoutId) return null;

							const workout = workouts.find((workout) => workout._id.equals(workoutId));
							if (!workout) return null;

							const workoutOfMesocycle: WorkoutOfMesocycle = {
								id: createId(),
								mesocycleId: mesocycleIds[mesocycleIdx],
								workoutId: workoutIds[workouts.findIndex((workout) => workout._id.equals(workoutId))],
								splitDayIndex,
								workoutStatus: workout.exercisesPerformed.length > 0 ? null : 'Skipped'
							};
							return workoutOfMesocycle;
						});
					})
					.filter((v) => v !== null)
			});

			const restDayIds: string[] = [];
			const restDaysCreate = prisma.workout.createMany({
				data: mesocycles.flatMap((mesocycle) => {
					const templateMesocycle = mesocycleTemplates.find((template) =>
						template._id.equals(mesocycle.templateMesoId)
					);
					if (!templateMesocycle) return [];

					return mesocycle.workouts.flatMap((workoutId, workoutIdx) => {
						if (workoutId) return [];

						let leftIndex = workoutIdx - 1;
						while (leftIndex >= 0 && mesocycle.workouts[leftIndex] === null) {
							leftIndex--;
						}

						let rightIndex = workoutIdx + 1;
						while (rightIndex < mesocycle.workouts.length && mesocycle.workouts[rightIndex] === null) {
							rightIndex++;
						}

						const leftValue = leftIndex >= 0 ? mesocycle.workouts[leftIndex] : null;
						const rightValue = rightIndex < mesocycle.workouts.length ? mesocycle.workouts[rightIndex] : null;

						const leftDistance = leftIndex >= 0 ? workoutIdx - leftIndex : Infinity;
						const rightDistance = rightIndex < mesocycle.workouts.length ? rightIndex - workoutIdx : Infinity;

						const nearestWorkoutId = leftDistance < rightDistance ? leftValue : rightValue;
						if (!nearestWorkoutId) return [];

						const nearestWorkout = workouts.find((w) => w._id.equals(nearestWorkoutId));
						if (!nearestWorkout) return [];

						const id = createId();
						restDayIds.push(id);
						const restDayWorkout: Prisma.WorkoutUncheckedCreateInput = {
							id,
							startedAt: new Date(nearestWorkout.startTimestamp),
							endedAt: new Date(nearestWorkout.startTimestamp),
							userBodyweight: 100, // Assumption of 100 bodyweight
							userId: ctx.userId
						};
						return restDayWorkout;
					});
				})
			});

			let restWorkoutsOfMesocycleCreated = 0;
			const restWorkoutsOfMesocycle = prisma.workoutOfMesocycle.createMany({
				data: mesocycles.flatMap((mesocycle, mesocycleIdx) => {
					const templateMesocycle = mesocycleTemplates.find((template) =>
						template._id.equals(mesocycle.templateMesoId)
					);
					if (!templateMesocycle) return [];

					return mesocycle.workouts.flatMap((workoutId, workoutIdx) => {
						if (workoutId) return [];

						const prismaWorkoutId = restDayIds[restWorkoutsOfMesocycleCreated];
						restWorkoutsOfMesocycleCreated++;

						return {
							splitDayIndex: workoutIdx % templateMesocycle.exerciseSplit.length,
							id: createId(),
							mesocycleId: mesocycleIds[mesocycleIdx],
							workoutId: prismaWorkoutId,
							workoutStatus: 'RestDay'
						};
					});
				})
			});

			await prisma.$transaction([
				exerciseSplitCreate,
				exerciseSplitDayCreate,
				exerciseSplitDayTemplateCreate,
				mesocycleCreate,
				mesocycleExerciseSplitDayCreate,
				mesocycleExerciseTemplateCreate,
				workoutCreate,
				workoutExerciseCreate,
				workoutExerciseSetCreate,
				workoutOfMesocycleCreate,
				restDaysCreate,
				restWorkoutsOfMesocycle
			]);
		})
});
