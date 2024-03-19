<script lang="ts">
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import { exerciseSplitStore } from '../exerciseSplitStore';

	let splitDays = $exerciseSplitStore.splitDays;
	let selectedDayIndex = splitDays.findIndex((splitDay) => splitDay !== null).toString();
</script>

<H2>New exercise split</H2>
<H3>Exercises</H3>

<Tabs.Root bind:value={selectedDayIndex}>
	<Tabs.List class="w-full overflow-x-auto justify-start">
		{#each splitDays as splitDay, i}
			{#if splitDay}
				<Tabs.Trigger class="grow basis-20 shrink-0" value={i.toString()}>{splitDay.name}</Tabs.Trigger>
			{:else}
				<Tabs.Trigger class="grow basis-20 shrink-0" value={i.toString()} disabled={true}>Rest</Tabs.Trigger>
			{/if}
		{/each}
	</Tabs.List>
	<Tabs.Content value="account">Make changes to your account here.</Tabs.Content>
	<Tabs.Content value="password">Change your password here.</Tabs.Content>
</Tabs.Root>
