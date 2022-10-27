import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { createClient } from 'redis';

export const Days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function generateRandomPhrase(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

type MyFixtures = {
    creatableUsername: string;
    registeredAccount: AccountDetails;
    user: User;
    loggedInPage: Page;
    split: Split;
    splitStoreLoadedPage: Page;
    splitWorkoutsLoadedPage: Page;
    splitCreatedPage: Page;
    extraSplits: Split[];
    extraSplitsCreatedPage: Page;
};

export const test = base.extend<MyFixtures>({
    creatableUsername: [
        // eslint-disable-next-line no-empty-pattern
        async ({}, use) => {
            const client = createClient();
            await client.connect();

            // Generate an unused username
            let username: string;
            do {
                username = 'user' + generateRandomPhrase(5);
            } while ((await client.get(username)) !== null);
            await use(username);
        },
        { scope: 'test' }
    ],
    registeredAccount: [
        async ({ creatableUsername, request }, use) => {
            const randomPassword = generateRandomPhrase(10);
            const credentials: AccountDetails = {
                username: creatableUsername,
                password: randomPassword
            };
            const registerRes = await request.post('/api/auth/register', {
                data: credentials
            });
            expect(registerRes.ok()).toStrictEqual(true);
            await use(credentials);
        },
        { scope: 'test' }
    ],
    user: [
        async ({ request, registeredAccount }, use) => {
            // Get the account details
            const data = await request.post('/api/auth/getUserData', {
                data: registeredAccount
            });
            const rawBody = await data.text();
            const userData: User = data ? JSON.parse(rawBody) : '';
            userData.password = registeredAccount.password;
            await use(userData);
        },
        { scope: 'test' }
    ],
    loggedInPage: [
        async ({ page, user }, use) => {
            // Login with account
            const loginRes = await page.request.post('/api/auth/login', {
                data: {
                    username: user.username,
                    password: user.password
                }
            });
            expect(loginRes.ok()).toStrictEqual(true);
            await use(page);
        },
        { scope: 'test' }
    ],
    split: [
        // eslint-disable-next-line no-empty-pattern
        async ({}, use) => {
            // Create sample split
            const split: Split = {
                name: 'PPL',
                schedule: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', 'Rest'],
                splitWorkouts: {
                    Push: [
                        { id: 1, name: 'Bench press', reps: 5, sets: 3, load: 25 },
                        { id: 2, name: 'Shoulder press', reps: 12, sets: 3, load: 15 },
                        { id: 3, name: 'Incline dumbbell press', reps: 12, sets: 3, load: 15 },
                        { id: 4, name: 'Triceps pushdowns', reps: 12, sets: 3, load: 15 },
                        { id: 5, name: 'Lateral raises', reps: 20, sets: 3, load: 5 },
                        { id: 6, name: 'Overhead triceps extensions', reps: 12, sets: 3, load: 10 }
                    ],
                    Pull: [
                        { id: 1, name: 'Deadlifts', reps: 5, sets: 3, load: 50 },
                        { id: 2, name: 'Pull ups', reps: 12, sets: 3, load: 40 },
                        { id: 3, name: 'Cable rows', reps: 12, sets: 3, load: 15 },
                        { id: 4, name: 'Face pulls', reps: 15, sets: 5, load: 10 },
                        { id: 5, name: 'Hammer curls', reps: 12, sets: 4, load: 10 },
                        { id: 6, name: 'Dumbbell curls', reps: 12, sets: 4, load: 10 }
                    ],
                    Legs: [
                        { id: 1, name: 'Squat', reps: 5, sets: 3, load: 25 },
                        { id: 2, name: 'Romanian deadlifts', reps: 12, sets: 3, load: 20 },
                        { id: 3, name: 'Leg press', reps: 12, sets: 3, load: 100 },
                        { id: 4, name: 'Leg curls', reps: 12, sets: 3, load: 15 },
                        { id: 5, name: 'Calf raises', reps: 12, sets: 5, load: 15 }
                    ]
                },
                progressiveOverload: 5,
                overloadFrequency: '/session',
                timeCreated: +new Date()
            };

            await use(split);
        },
        { scope: 'test' }
    ],
    splitStoreLoadedPage: [
        async ({ loggedInPage, split }, use) => {
            await loggedInPage.goto('/splits/new');
            await loggedInPage.fill('input[data-test-id=split-name-input]', split.name);
            await loggedInPage.fill('input[data-test-id=Mon]', split.schedule[0]);
            await loggedInPage.fill('input[data-test-id=Tue]', split.schedule[1]);
            await loggedInPage.fill('input[data-test-id=Wed]', split.schedule[2]);
            await loggedInPage.fill('input[data-test-id=Thu]', split.schedule[3]);
            await loggedInPage.fill('input[data-test-id=Fri]', split.schedule[4]);
            await loggedInPage.fill('input[data-test-id=Sat]', split.schedule[5]);
            await loggedInPage.fill('input[data-test-id=Sun]', split.schedule[6]);
            await loggedInPage
                .locator('button[data-test-id=create-schedule-button]', {
                    hasText: 'Create 3 unique workouts'
                })
                .click();
            await expect(loggedInPage).toHaveURL('/splits/new/workouts');
            await use(loggedInPage);
        },
        { scope: 'test' }
    ],
    splitWorkoutsLoadedPage: [
        async ({ splitStoreLoadedPage, split }, use) => {
            const page = splitStoreLoadedPage;

            const uniqueWorkouts = new Set<string>();
            for (const workout of split.schedule) {
                if (workout !== 'Rest') {
                    uniqueWorkouts.add(workout);
                }
            }

            for (const workout of uniqueWorkouts) {
                for (const day of Days) {
                    const workoutElement = page.locator(`p[data-test-id=workout-${day}]`);
                    const currentWorkout = (await workoutElement.textContent()) as string;
                    if (currentWorkout === workout) {
                        await workoutElement.click();
                        await expect(page.locator('[data-test-id=workout-name]')).toHaveText(
                            workout
                        );
                    }
                }
                const exercises = split.splitWorkouts[workout];
                for (const exercise of exercises) {
                    await page.locator('button[data-test-id=add-button]').click();
                    await page.fill('input[data-test-id=name-input]', exercise.name);
                    await page.fill('input[data-test-id=reps-input]', exercise.reps.toString());
                    await page.fill('input[data-test-id=sets-input]', exercise.sets.toString());
                    await page.fill('input[data-test-id=load-input]', exercise.load.toString());
                    await page.locator('button[data-test-id=save-button]').click();
                }
            }

            await use(page);
        },
        { scope: 'test' }
    ],
    splitCreatedPage: [
        async ({ splitWorkoutsLoadedPage, split }, use) => {
            await splitWorkoutsLoadedPage
                .locator('button', { hasText: 'Set split options' })
                .click();

            const page = splitWorkoutsLoadedPage;
            const slider = page.locator('input[data-test-id="progressionValueSlider"]');
            const progressionValue = page.locator('div[data-test-id="progressionValueDiv"]');
            const frequencySelector = page.locator('[data-test-id="overloadFrequencySelector"]');

            await slider.fill(split.progressiveOverload.toString());
            await expect(progressionValue).toHaveText(`${split.progressiveOverload}%`);
            await frequencySelector.selectOption(split.overloadFrequency);

            const createSplitButton = page.locator('[data-test-id="createSplitButton"]');
            await Promise.all([
                createSplitButton.click(),
                page.waitForRequest('/api/splits/saveSplit'),
                page.waitForResponse((res) => res.ok())
            ]);

            const modalTitle = page.locator('[data-test-id="modal-title"]');
            const modalTexts = page.locator('[data-test-id="modal-messages-list"] li');
            const modalCloseButton = page.locator('[data-test-id="close-modal-button"]');

            await expect(modalTitle).toHaveText('Success');
            expect(await modalTexts.allTextContents()).toEqual(['Split created successfully']);

            await Promise.all([modalCloseButton.click(), page.waitForNavigation()]);
            expect(page.url()).toBe('http://localhost:4173/');

            await use(page);
        },
        { scope: 'test' }
    ],
    extraSplits: [
        async ({}, use) => {
            const split2Date = new Date();
            split2Date.setDate(split2Date.getDate() - 1);
            const split2: Split = {
                name: 'Upper Lower',
                schedule: ['Upper 1', 'Lower 1', 'Rest', 'Upper 2', 'Lower 2', 'Rest', 'Rest'],
                splitWorkouts: {
                    'Upper 1': [
                        { id: 1, name: 'Bench press', reps: 5, sets: 3, load: 25 },
                        { id: 2, name: 'Lat pulldown', reps: 12, sets: 3, load: 15 },
                        { id: 3, name: 'Incline dumbbell press', reps: 12, sets: 3, load: 15 },
                        { id: 4, name: 'Seated row', reps: 12, sets: 3, load: 15 },
                        { id: 5, name: 'Overhead press', reps: 12, sets: 3, load: 15 },
                        { id: 6, name: 'Triceps pressdown', reps: 12, sets: 3, load: 10 }
                    ],
                    'Lower 1': [
                        { id: 1, name: 'Squat', reps: 5, sets: 3, load: 25 },
                        { id: 2, name: 'Romanian deadlift', reps: 12, sets: 3, load: 40 },
                        { id: 3, name: 'Leg press', reps: 12, sets: 3, load: 75 },
                        { id: 4, name: 'Seated leg curl', reps: 12, sets: 3, load: 15 },
                        { id: 5, name: 'Standing calf raise', reps: 8, sets: 4, load: 15 }
                    ],
                    'Upper 2': [
                        { id: 1, name: 'Dumbbell bench press', reps: 12, sets: 3, load: 15 },
                        { id: 2, name: 'Chin up', reps: 12, sets: 3, load: 45 },
                        { id: 3, name: 'Dumbbell fly', reps: 12, sets: 3, load: 10 },
                        { id: 4, name: 'Dumbbell row', reps: 8, sets: 3, load: 15 },
                        { id: 5, name: 'Lateral raise', reps: 12, sets: 3, load: 5 },
                        { id: 6, name: 'Standing dumbbell curl', reps: 12, sets: 3, load: 10 },
                        { id: 7, name: 'Skullcrushers', reps: 12, sets: 3, load: 5 }
                    ],
                    'Lower 2': [
                        { id: 1, name: 'Deadlift', reps: 5, sets: 4, load: 50 },
                        { id: 2, name: 'Leg press', reps: 12, sets: 4, load: 75 },
                        { id: 3, name: 'Bulgarian split squat', reps: 12, sets: 3, load: 35 },
                        { id: 4, name: 'Seated calf raise', reps: 15, sets: 4, load: 50 }
                    ]
                },
                progressiveOverload: 7.5,
                overloadFrequency: '/week',
                timeCreated: +split2Date
            };

            const split3: Split = {
                name: '3 Day Full Body',
                schedule: ['Day 1', 'Rest', 'Day 2', 'Rest', 'Day 3', 'Rest', 'Rest'],
                splitWorkouts: {
                    'Day 1': [
                        { id: 1, name: 'Squat', reps: 12, sets: 3, load: 35 },
                        { id: 2, name: 'Bench press', reps: 12, sets: 3, load: 25 },
                        { id: 3, name: 'Barbell row', reps: 12, sets: 3, load: 15 },
                        { id: 4, name: 'Seated dumbbell press', reps: 12, sets: 3, load: 15 },
                        { id: 5, name: 'Skullcrushers', reps: 12, sets: 3, load: 15 }
                    ],
                    'Day 2': [
                        { id: 1, name: 'Deadlift', reps: 5, sets: 3, load: 45 },
                        { id: 2, name: 'Tricep dips', reps: 12, sets: 3, load: 15 },
                        { id: 3, name: 'Pull up', reps: 12, sets: 3, load: 25 },
                        { id: 4, name: 'Military press', reps: 12, sets: 3, load: 15 },
                        { id: 5, name: 'Crunches', reps: 12, sets: 4, load: 15 }
                    ],
                    'Day 3': [
                        { id: 1, name: 'Leg press', reps: 12, sets: 3, load: 75 },
                        { id: 2, name: 'Incline bench press', reps: 12, sets: 3, load: 25 },
                        { id: 3, name: 'Dumbbell row', reps: 8, sets: 3, load: 15 },
                        { id: 4, name: 'Upright row', reps: 12, sets: 3, load: 20 },
                        { id: 5, name: 'Standing dumbbell curl', reps: 12, sets: 3, load: 10 },
                        { id: 6, name: 'Skullcrushers', reps: 12, sets: 3, load: 5 }
                    ]
                },
                progressiveOverload: 7.5,
                overloadFrequency: '/week',
                timeCreated: +new Date()
            };

            const extraSplits = [split2, split3];
            await use(extraSplits);
        },
        { scope: 'test' }
    ],
    extraSplitsCreatedPage: [
        async ({ splitCreatedPage, extraSplits }, use) => {
            const page = splitCreatedPage;
            const res1 = await page.request.post('/api/splits/saveSplit', {
                data: {
                    split: extraSplits[0]
                }
            });
            expect(res1.status()).toBe(200);
            const res2 = await page.request.post('/api/splits/saveSplit', {
                data: {
                    split: extraSplits[1]
                }
            });
            expect(res2.status()).toBe(200);

            // Force invalidateAll()
            await page.goto('/');
            await page.reload();
            
            await use(page);
        },
        { scope: 'test' }
    ]
});

export const messages: Record<number, string> = {
    0: 'Why so low?',
    2.5: 'Not bad',
    5: 'Nice sweet spot',
    7.5: 'Good for beginners!',
    10: 'A bit tough huh?',
    12.5: 'Sure about this?',
    15: 'Entering danger zone!',
    17.5: "Don't overdo it!",
    20: "Don't overdo it!",
    22.5: "Don't overdo it!",
    25: 'What!?'
};

export const colors = new Map<number, Array<string>>([
    [0, ['text-white', 'border-white', 'stroke-white', 'fill-white']],
    [2.5, ['text-green-300', 'border-green-300', 'stroke-green-300', 'fill-green-300']],
    [5, ['text-green-400', 'border-green-400', 'stroke-green-400', 'fill-green-400']],
    [7.5, ['text-lime-500', 'border-lime-500', 'stroke-lime-500', 'fill-lime-500']],
    [10, ['text-yellow-400', 'border-yellow-400', 'stroke-yellow-400', 'fill-yellow-400']],
    [12.5, ['text-amber-500', 'border-amber-500', 'stroke-amber-500', 'fill-amber-500']],
    [15, ['text-orange-500', 'border-orange-500', 'stroke-orange-500', 'fill-orange-500']],
    [17.5, ['text-red-500', 'border-red-500', 'stroke-red-500', 'fill-red-500']],
    [20, ['text-red-500', 'border-red-500', 'stroke-red-500', 'fill-red-500']],
    [22.5, ['text-red-500', 'border-red-500', 'stroke-red-500', 'fill-red-500']],
    [25, ['text-red-600', 'border-red-600', 'stroke-red-600', 'fill-red-600']]
]);

export function getFormattedDate(timestamp: number) {
    const date = new Date(timestamp);
    let day = date.getDate();
    let month = (date.getMonth() + 1).toString();
    if (Number(month) < 10) {
        month = '0' + month;
    }
    let year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

export { expect } from '@playwright/test';
