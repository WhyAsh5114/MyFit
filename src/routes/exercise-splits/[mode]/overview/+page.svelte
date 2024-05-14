<script lang="ts">
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import PerDayChartComponent from '../exercises/(components)/PerDayChartComponent.svelte';
	import { exerciseSplitRunes } from '../exerciseSplitRunes.svelte';
	import PerMuscleGroupComponent from '../exercises/(components)/PerMuscleGroupComponent.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
</script>

<H3>Overview</H3>
<Tabs.Root value="Per day" class="w-full">
	<Tabs.List class="grid w-full grid-cols-2">
		<Tabs.Trigger value="Per day">Per day</Tabs.Trigger>
		<Tabs.Trigger value="Per muscle group">Per muscle group</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="Per day">
		<Card.Root class="h-72 p-4">
			<PerDayChartComponent splitExercises={exerciseSplitRunes.splitExercises} />
		</Card.Root>
	</Tabs.Content>
	<Tabs.Content value="Per muscle group">
		<Card.Root class="h-80 p-4 flex flex-col gap-2">
			<PerMuscleGroupComponent splitExercises={exerciseSplitRunes.splitExercises} />
		</Card.Root>
	</Tabs.Content>
</Tabs.Root>

<div class="grid grid-cols-2 gap-1 mt-auto">
	<Button variant="secondary" href="./exercises">Previous</Button>
	<Button>Save</Button>
</div>
