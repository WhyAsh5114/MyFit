/// <reference types="@sveltejs/kit" />

declare namespace App {
    interface PageData {
        user?: User;
    }
}

interface AccountDetails {
    username: string;
    password: string;
}

interface User {
    username: string;
    password?: string;
    splits: Record<string, Split>;
    workouts?: Record<string, Workout>;
    activeSplit?: string;
}

interface Split {
    name: string;
    schedule: string[];
    splitWorkouts: Record<string, Array<Exercise>>;
    progressiveOverload: number;
    overloadFrequency: '/session' | '/week' | '/month';
    timeCreated: number;
}

interface Workout {
    name: string;
    createdDate: Date;
    exercises: Exercise[];
    belongsToSplit: string | undefined;
    workoutType: string | undefined;
    exhaustionRating: number;
    duration: number;
}

interface Exercise {
    id: number;
    name: string;
    reps: number;
    sets: number;
    load: number;
}
