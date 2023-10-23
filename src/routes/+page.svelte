<script>
	import { navigating } from '$app/stores';
	export let data;

	let date = new Date();
	let todaysDay = date.toLocaleDateString('en-US', { weekday: 'long' });
	let workoutDay = date.getDay() - 1 >= 0 ? date.getDay() - 1 : 6;

	let todaysWorkoutPerformed = false;
	const workouts = data.workouts?.reverse();
	if (workouts) {
		workouts.forEach((workout) => {
			if (!workout) return;
			let workoutTimestamp = workout?.startTimestamp;
			let today = new Date().setHours(0, 0, 0, 0);
			let workoutDay = new Date(workoutTimestamp).setHours(0, 0, 0, 0);

			if (today === workoutDay) {
				todaysWorkoutPerformed = true;
			}
		});
	}
</script>

<div class="flex flex-col grow justify-center gap-2">
	<a href="/mesocycles" class="btn btn-primary">
		{#if $navigating?.to?.url.pathname === '/mesocycles'}
			<span class="loading loading-spinner" />
		{/if}
		Mesocycles
	</a>
	<a href="/workouts" class="btn btn-primary">
		{#if $navigating?.to?.url.pathname === '/workouts'}
			<span class="loading loading-spinner" />
		{/if}
		Workouts
	</a>
</div>

{#if data.parentMesocycle}
	<div class="flex bg-primary items-center justify-between rounded-md w-full p-3 border-b-accent border-b-2">
		{#if data.parentMesocycle.splitSchedule[workoutDay] !== ''}
			{#if !todaysWorkoutPerformed}
				<p>
					{todaysDay}: <span class="font-semibold text-white">{data.parentMesocycle?.splitSchedule[workoutDay]}</span>
				</p>
				<a class="btn btn-sm btn-accent" href="/workouts/new">Go</a>
			{:else}
				<span class="font-semibold text-white">All done for today!</span>
				<span class="btn btn-sm btn-accent btn-circle">✓</span>
			{/if}
		{:else}
			<p>
				{todaysDay}: <span class="font-semibold text-white">Rest, kalm and chill</span>
			</p>
		{/if}
	</div>
{/if}
