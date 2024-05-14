<script lang="ts">
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import PerDayChartComponent from '../exercises/(components)/PerDayChartComponent.svelte';
	import { exerciseSplitRunes } from '../exerciseSplitRunes.svelte';
</script>

<H3>Overview</H3>
<Tabs.Root value="Per day" class="w-full">
	<Tabs.List class="grid w-full grid-cols-2">
		<Tabs.Trigger value="Per day">Per day</Tabs.Trigger>
		<Tabs.Trigger value="Per muscle group">Per muscle group</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="Per day">
		<Card.Root class="h-72 border p-4">
			<PerDayChartComponent splitExercises={exerciseSplitRunes.splitExercises} />
		</Card.Root>
	</Tabs.Content>
	<Tabs.Content value="Per muscle group">
		<Card.Root>
			<Card.Content class="space-y-2"></Card.Content>
		</Card.Root>
	</Tabs.Content>
</Tabs.Root>
