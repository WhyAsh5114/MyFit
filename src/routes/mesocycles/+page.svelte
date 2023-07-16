<script lang="ts">
	import { navigating } from '$app/stores';

	export let data;
	let parentMesocycle: Mesocycle | null = null;
	$: if (data.mesocycles && data.activeMesocycle) {
		parentMesocycle = data.mesocycles[data.activeMesocycle.mesoID];
	}

	let totalMesocycles = 0;
	$: data.mesocycles?.forEach((meso) => {
		if (meso) totalMesocycles++;
	});
</script>

{#if data.mesocycles && totalMesocycles > 0}
	<h3 class="text-left w-full text-xl font-bold text-accent mb-2">Active</h3>
	{#if data.activeMesocycle && parentMesocycle}
		<a
			class="btn relative flex-col btn-primary normal-case rounded-lg w-full p-2 flex-nowrap h-fit gap-3"
			href="/mesocycles/view/{data.activeMesocycle.mesoID}"
		>
			{#if $navigating?.to?.url.pathname === `/mesocycles/view/${data.activeMesocycle.mesoID}`}
				<div
					class="absolute h-full w-full bg-black bg-opacity-75 grid place-items-center rounded-lg"
				>
					<span class="loading loading-spinner loading-lg" />
				</div>
			{/if}
			<div class="flex justify-between items-center w-full">
				<h3 class="ml-2 text-lg text-ellipsis">
					{parentMesocycle.name}
				</h3>
				<p class="badge badge-secondary ml-auto">
					{parentMesocycle.duration} weeks
				</p>
			</div>
			<div class="flex w-full gap-1 flex-wrap">
				{#each parentMesocycle.splitSchedule as workout}
					{#if workout !== ''}
						<p class="font-normal badge w-fit">{workout}</p>
					{:else}
						<p class="font-normal badge badge-accent" />
					{/if}
				{/each}
			</div>
		</a>
	{:else}
		<div
			class="btn no-animation relative flex-col btn-primary normal-case rounded-lg w-full p-2 flex-nowrap h-fit gap-3"
		>
			<h3 class="text-lg w-full text-left text-warning">No mesocycle active</h3>
			<p class="font-normal text-left leading-snug">
				You can start one by opening one from the list below and clicking start
			</p>
		</div>
	{/if}
	<h3 class="text-left w-full text-xl font-bold mt-6 mb-2">Others</h3>
	<ul class="flex flex-col gap-2 h-px grow w-full overflow-y-auto overflow-x-hidden mb-2">
		{#each data.mesocycles as meso, i}
			{#if meso && i !== data.activeMesocycle?.mesoID}
				<li>
					<a
						class="btn relative flex-col btn-primary normal-case rounded-lg w-full p-2 flex-nowrap h-fit gap-3"
						href="/mesocycles/view/{i}"
					>
						{#if $navigating?.to?.url.pathname === `/mesocycles/view/${i}`}
							<div
								class="absolute h-full w-full bg-black bg-opacity-75 grid place-items-center rounded-lg"
							>
								<span class="loading loading-spinner loading-lg" />
							</div>
						{/if}
						<div class="flex justify-between items-center w-full">
							<h3 class="ml-2 text-lg text-ellipsis">{meso.name}</h3>
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
				</li>
			{/if}
		{/each}
	</ul>
{:else}
	<div class="grow flex items-center">
		<p class="font-semibold text-lg">You haven't created any mesocycles</p>
	</div>
{/if}
<a href="/mesocycles/new/basics" class="btn btn-accent btn-block mt-auto">Create new mesocycle</a>
