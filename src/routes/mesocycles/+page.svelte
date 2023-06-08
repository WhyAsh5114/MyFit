<script>
	export let data;
</script>

{#if data.mesocycles}
	<ul class="flex flex-col gap-2 h-px grow w-full overflow-y-auto mb-2">
		{#each data.mesocycles as meso, i}
			<a
				class="btn flex-col btn-primary normal-case rounded-lg w-full p-2 flex-nowrap h-fit gap-3"
				href="/mesocycles/view/{i}"
			>
				<div class="flex justify-between items-center w-full">
					<h3 class="text-lg">{meso.name}</h3>
					<p class="badge badge-secondary ml-auto">{meso.duration} weeks</p>
				</div>
				<div class="flex w-full gap-0.5 overflow-x-auto">
					{#each meso.splitSchedule as workout}
						{#if workout !== ''}
							<p class="font-normal badge w-fit">{workout}</p>
						{:else}
							<p class="font-normal badge badge-accent"></p>
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
