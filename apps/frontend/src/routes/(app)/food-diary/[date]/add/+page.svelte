<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { PlusCircleIcon, ScanBarcodeIcon } from '@lucide/svelte';
	import { Debounced } from 'runed';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages';
	import FoodInfinite from './food-infinite.svelte';
	import { goto } from '$app/navigation';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

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
		<Input type="text" placeholder={m['foodDiary.searchPlaceholder']()} bind:value={search} />
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
