<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { PlusCircleIcon, ScanBarcodeIcon } from '@lucide/svelte';
	import { Debounced } from 'runed';
	import FoodInfinite from './components/food-infinite.svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	let search = $state('');
	const debounced = new Debounced(() => search, 500);
</script>

<div class="grid grid-cols-2 gap-2">
	<Label class="col-span-2 flex flex-col items-start">
		Search for foods
		<Input type="text" placeholder="apple pie" bind:value={search} />
	</Label>
	<Button variant="secondary"><PlusCircleIcon /> Add manually</Button>
	<Button href={resolve(`/food-diary/${page.params.date}/add/scan`)}>
		Scan barcode <ScanBarcodeIcon />
	</Button>
</div>

<FoodInfinite search={debounced.current} />
