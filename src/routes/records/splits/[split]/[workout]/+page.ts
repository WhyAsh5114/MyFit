import { CreatedWorkouts } from '../editSplitStore';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
    const { user } = await parent();
    let createdWorkouts;
    CreatedWorkouts.subscribe((value) => {
        createdWorkouts = value;
    })
    console.log(createdWorkouts);
    if (params.split in user.splits) {
        if (
            params.workout in user.splits[params.split].splitWorkouts ||
            params.workout in CreatedWorkouts
        ) {
            return { user };
        }
        throw error(404, `${params.split}\t${params.workout}`);
    }
    throw error(404, `${params.split}`);
};
