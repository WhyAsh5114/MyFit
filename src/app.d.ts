/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
    interface Locals {
        user?: UserData;
    }
    // interface Platform {}
    interface Session {
        user?: UserData;
    }
    // interface Stuff {}
}

interface AccountDetails {
    username: string;
    password: string;
}

interface User {
    username: string;
    password?: string;
    splits: Record<string, Split>;
    workouts?: Record<string, Array<Exercise>>;
}

interface UserData {
    username: string;
    splits: Record<string, Split>;
    workouts?: Record<string, Array<Exercise>>;
}

interface Split {
    name: string;
    schedule: string[];
    splitWorkouts: Record<string, Array<Exercise>>;
    progressiveOverload: number;
    overloadFrequency: '/session' | '/week' | '/month';
    dateCreated: string;
}

interface Exercise {
    id: number;
    name: string;
    reps: number;
    sets: number;
    load: number;
}
