<script>
	import { navigating } from '$app/stores';

	export let data;
</script>

{#if data.mesocycles}
	<ul class="flex flex-col gap-2 h-px grow w-full overflow-y-auto overflow-x-hidden mb-2">
		{#each data.mesocycles as meso, i}
			<a
				class="btn relative flex-col btn-primary normal-case rounded-lg w-full p-2 flex-nowrap h-fit gap-3"
				href="/mesocycles/view/{i}"
			>
				{#if $navigating?.to?.url.pathname === `/mesocycles/view/${i}`}
					<div class="absolute h-full w-full bg-black bg-opacity-75 grid place-items-center rounded-lg">
						<span class="loading loading-spinner loading-lg" />
					</div>
				{/if}
				<div class="flex justify-between items-center w-full">
					<h3 class="ml-2 text-lg">{meso.name}</h3>
					<p class="badge badge-secondary ml-auto">{meso.duration} weeks</p>
				</div>
				<div class="flex w-full gap-1 flex-wrap">
					{#each meso.splitSchedule as workout}
						{#if workout !== ''}
							<p class="font-normal badge w-fit">{workout}</p>
						{:else}
							<p class="font-normal badge badge-accent" />
						{/if}
					{/each}
				</div>
			</a>
		{/each}
	</ul>
{:else}
	<p>You haven't created any mesocycles</p>
{/if}
<a href="/mesocycles/new/basics" class="btn btn-accent mt-auto btn-block">Create new mesocycle</a>
