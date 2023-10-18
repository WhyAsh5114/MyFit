<script>
	import { navigating } from '$app/stores';
	export let data;

	let date = new Date();
	let todaysDay = date.toLocaleDateString('en-US', { weekday: 'long' });
	let workoutDay = date.getDay() - 1 >= 0 ? date.getDay() - 1 : 6;
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
			<p>
				{todaysDay}: <span class="font-semibold text-white">{data.parentMesocycle?.splitSchedule[workoutDay]}</span>
			</p>
			<a class="btn btn-sm btn-accent" href="/workouts/new">Start</a>
		{:else}
			<p>
				{todaysDay}: <span class="font-semibold text-white">Rest, kalm and chill</span>
			</p>
		{/if}
	</div>
{/if}
