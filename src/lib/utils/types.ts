import type { RouterOutputs } from '$lib/trpc/router';

export type WorkoutsOfMesocycle = NonNullable<RouterOutputs['mesocycles']['findById']>['workoutsOfMesocycle'];
export type WorkoutExercise = WorkoutsOfMesocycle[number]['workout']['workoutExercises'][number];