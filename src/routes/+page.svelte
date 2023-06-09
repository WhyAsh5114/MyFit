<script>
	import { navigating } from '$app/stores';
</script>

<div class="flex flex-col gap-2">
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
