<script lang="ts">
	import { flip } from 'svelte/animate';
	import { scale, slide } from 'svelte/transition';

	export let workoutExercises: WorkoutExercise[];
</script>

{#each workoutExercises as exercise, i (exercise.name)}
	<li
		class="flex flex-col bg-secondary w-full rounded-lg text-black p-3 h-fit"
		animate:flip={{ duration: 200 }}
		in:slide|local={{ duration: 200 }}
		out:scale|local={{ duration: 200 }}
	>
		<div class="flex justify-between">
			<h5 class="text-lg font-bold">{exercise.name}</h5>
			<div class="dropdown dropdown-end w-5">
				<button>
					<img src="/HamburgerMenu.svg" alt="menu" />
				</button>
				<ul class="menu dropdown-content p-2 shadow-black bg-base-100 rounded-md shadow-md">
					<li>
						
					</li>
				</ul>
			</div>
		</div>
		<div class="flex justify-between items-end -mt-2">
            <h6 class="capitalize text-sm font-semibold italic">{exercise.setType} sets</h6>
            <div class="flex justify-between mt-2.5 text-sm">
                <span class="badge badge-error text-white">{exercise.muscleTarget}</span>
            </div>
        </div>
        <div class="flex flex-col gap-2">
            <div class="h-px w-full bg-black mt-2"></div>
            <div class="flex justify-around">
                <p>Reps</p>
                <p>Load</p>
                <p>RIR</p>
            </div>
            {#each exercise.repsLoadRIR as repsLoadRIR}
                <div class="flex justify-around">
                    <select class="select select-sm text-white">
                        <option value="" disabled selected>?</option>
                        {#each Array.from(Array(100).keys()) as i}
                            {#if repsLoadRIR[0] === (i + 1)}
                                <option selected>{i + 1}</option>
                            {:else}
                                <option>{i + 1}</option>
                            {/if}
                        {/each}
                    </select>
                    <select class="select select-sm text-white">
                        {#each Array.from(Array(100).keys()) as i}
                            {#if repsLoadRIR[1] === (i + 1) * 2.5}
                                <option selected>{(i + 1) * 2.5} kg</option>
                            {:else}
                                <option>{(i + 1) * 2.5} kg</option>
                            {/if}
                        {/each}
                    </select>
                    <select class="select select-sm text-white">
                        {#each Array.from(Array(5).keys()) as i}
                            {#if repsLoadRIR[2] === i}
                                <option selected>{i} RIR</option>
                            {:else}
                                <option>{i} RIR</option>
                            {/if}
                        {/each}
                    </select>
                </div>
            {/each}
        </div>
	</li>
{/each}
