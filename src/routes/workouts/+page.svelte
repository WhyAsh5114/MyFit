<script lang="ts">
	export let data;

	let selectedMesocycle: undefined | number;
</script>

<div class="flex flex-col bg-primary p-5 rounded-lg w-full">
	<h3 class="card-title">Current Mesocycle</h3>
	<div class="h-0.5 bg-black mt-1 mb-4" />
	<div class="flex gap-2">
		<select class="select select-sm select-bordered grow" bind:value={selectedMesocycle}>
			{#if data.mesocycles === null || data.mesocycles.length === 0}
				<option value={undefined}>No mesocycle created</option>
			{:else}
				{#if !data.activeMesocycle}
					<option selected disabled value={undefined}>No active mesocycle</option>
				{/if}
				{#each data.mesocycles as meso, i}
					{#if meso}
						{#if data.activeMesocycle?.mesoID === i}
							<option selected value={i}>{meso.name}</option>
						{:else}
							<option value={i}>{meso.name}</option>
						{/if}
					{/if}
				{/each}
			{/if}
		</select>
	</div>
</div>
<div class="grow border w-full my-2">

</div>
<a class="btn btn-block btn-accent" href="/workouts/new">
	Log new workout
</a>
