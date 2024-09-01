import type { RouterOutputs } from '$lib/trpc/router';

export type Mesocycle = NonNullable<RouterOutputs['mesocycles']['findById']>;
export type WorkoutsOfMesocycle = Mesocycle['workoutsOfMesocycle'];
export type Workout = WorkoutsOfMesocycle[number]['workout'];
export type WorkoutExercise = Workout['workoutExercises'][number];
