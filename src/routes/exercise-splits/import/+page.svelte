<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import {
		ExerciseSplitCreateWithoutUserInputSchema,
		ExerciseSplitDayCreateWithoutExerciseSplitInputSchema,
		ExerciseTemplateCreateWithoutExerciseSplitDayInputSchema
	} from '$lib/zodSchemas';
	import { toast } from 'svelte-sonner';
	import { exerciseSplitRunes } from '../manage/exerciseSplitRunes.svelte';
	import { goto } from '$app/navigation';

	let splitFile = $state<File>();

	async function validateAndImportSplit() {
		if (!splitFile) return;

		try {
			const splitData = JSON.parse(await splitFile.text());

			const { exerciseSplitDays, ...split } = splitData;
			ExerciseSplitCreateWithoutUserInputSchema.parse(split);

			exerciseSplitDays.forEach((data: { [x: string]: unknown; exercises: unknown[] }) => {
				const { exercises, ...splitDay } = data;
				ExerciseSplitDayCreateWithoutExerciseSplitInputSchema.parse(splitDay);

				exercises.forEach((data) => {
					ExerciseTemplateCreateWithoutExerciseSplitDayInputSchema.parse(data);
				});
			});

			exerciseSplitRunes.loadExerciseSplit(splitData);
			goto('/exercise-splits/manage/structure');
		} catch (error) {
			if (error instanceof Error) {
				toast.error(error.message);
			}
		}
	}
</script>

<H2>Exercise splits</H2>
<H3>Import</H3>

<div class="grid w-full items-center gap-1.5">
	<Label for="picture">Exercise split JSON file</Label>
	<Input
		id="picture"
		type="file"
		accept=".json"
		onchange={(e) => {
			const file = e.currentTarget.files?.item(0);
			if (file) splitFile = file;
		}}
	/>
</div>

<Button class="mt-auto" onclick={validateAndImportSplit}>Import</Button>
