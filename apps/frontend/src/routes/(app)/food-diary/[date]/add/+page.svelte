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

	let search = $state(page.url.searchParams.get('search') ?? '');
	const debounced = new Debounced(() => search, 500);

	$effect(() => {
		if (debounced.current.trim().length === 0) {
			goto(resolve(`/food-diary/${page.params.date}/add`));
			return;
		}
		goto(resolve(`/food-diary/${page.params.date}/add?search=${debounced.current}`));
	});
</script>

<div class="grid grid-cols-2 gap-2">
	<Label class="col-span-2 flex flex-col items-start">
		{m['foodDiary.searchFoods']()}
		<Input type="text" placeholder={m['foodDiary.searchPlaceholder']()} bind:value={search} />
	</Label>
	<Button variant="secondary" href={resolve(`/food-diary/${page.params.date}/add/manual`)}>
		<PlusCircleIcon />
		{m['foodDiary.addManually']()}
	</Button>
	<Button href={resolve(`/food-diary/${page.params.date}/add/scan`)}>
		{m['foodDiary.scanBarcode']()}
		<ScanBarcodeIcon />
	</Button>
</div>

<FoodInfinite />
