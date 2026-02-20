<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { PlusCircleIcon, ScanBarcodeIcon, SearchIcon } from '@lucide/svelte';
	import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
	import { Debounced } from 'runed';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages';
	import FoodInfinite from './food-infinite.svelte';
	import { goto } from '$app/navigation';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { useGetCurrentUserQuery } from '$lib/features/user/get-current-user';

	const getCurrentUserQuery = useGetCurrentUserQuery();

	let search = $state(page.url.searchParams.get('search') ?? '');
	const debounced = new Debounced(() => search, 500);
	const params = new SvelteURLSearchParams(page.url.searchParams);

	$effect(() => {
		if (debounced.current.trim().length === 0) {
			params.delete('search');
		} else {
			params.set('search', debounced.current);
		}

		goto(resolve(`/food-diary/${page.params.date}/add?${params.toString()}`), {
			replaceState: true
		});
	});
</script>

<div class="grid grid-cols-2 gap-2">
	<Label class="col-span-2 flex flex-col items-start">
		{m['foodDiary.searchForFoods']()}
		<ButtonGroup.Root class="w-full">
			<InputGroup.Root class="w-full">
				<InputGroup.Addon>
					<SearchIcon />
				</InputGroup.Addon>
				<InputGroup.Input
					type="text"
					placeholder={m['foodDiary.searchPlaceholder']()}
					bind:value={search}
				/>
			</InputGroup.Root>
			<Select.Root
				type="single"
				value={params.get('meal') ?? ''}
				onValueChange={(value) => params.set('meal', value)}
			>
				<Select.Trigger>
					{params.get('meal') === '' || params.get('meal') === null
						? 'No meal'
						: params.get('meal')}
				</Select.Trigger>
				<Select.Content align="end">
					{#each getCurrentUserQuery.data?.foodDiaryMeals as meal (meal)}
						<Select.Item value={meal}>
							{meal}
						</Select.Item>
					{/each}
					<Select.Item value="">No meal</Select.Item>
				</Select.Content>
			</Select.Root>
		</ButtonGroup.Root>
	</Label>
	<Button
		variant="secondary"
		href={resolve(`/food-diary/${page.params.date}/add/manual?${params.toString()}`)}
	>
		<PlusCircleIcon />
		{m['foodDiary.addManually']()}
	</Button>
	<Button href={resolve(`/food-diary/${page.params.date}/add/scan?${params.toString()}`)}>
		{m['foodDiary.scanBarcode']()}
		<ScanBarcodeIcon />
	</Button>
</div>

<FoodInfinite {params} />
