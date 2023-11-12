<script lang="ts">
	export let dayText: string;
	export let splitDay: MesocycleTemplate["exerciseSplit"][number];

	let isRestDay = splitDay === null;
	$: splitDay = isRestDay ? null : splitDay ?? { name: "", exercises: [] };
</script>

<div class="flex justify-between items-center">
	<div class="join basis-3/4 items-center shrink">
		<span class="btn btn-primary btn-sm join-item basis-16 p-0 shrink-0 text-center">{dayText}</span>
		{#if splitDay !== null}
			<input
				class="input input-bordered join-item input-sm"
				id="{dayText}-workout-name"
				bind:value={splitDay.name}
				required
			/>
		{:else}
			<input
				class="input input-bordered join-item input-sm"
				id="{dayText}-workout-name"
				placeholder="Rest"
				disabled
			/>
		{/if}
	</div>
	<input type="checkbox" class="checkbox shrink-0" id="is-{dayText}-rest" bind:checked={isRestDay} />
</div>
