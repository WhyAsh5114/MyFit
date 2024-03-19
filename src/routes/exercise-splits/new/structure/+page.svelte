<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import { exerciseSplit } from '../exerciseSplitStore';

	let splitName = $exerciseSplit.name;
	let splitDayNames = $exerciseSplit.splitDays.map((splitDay) => splitDay?.name ?? null);
</script>

<H2>New exercise split</H2>
<H3>Structure</H3>

<div class="flex w-full max-w-sm flex-col gap-1.5">
	<Label for="splitName">Exercise split name</Label>
	<Input id="splitName" placeholder="Type here" bind:value={splitName} />
</div>
