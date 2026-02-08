<script lang="ts">
	import * as Empty from '$lib/components/ui/empty/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { PlusCircleIcon, ScanBarcodeIcon, SearchIcon } from '@lucide/svelte';
</script>

<Card.Root>
	<Card.Content class="grid grid-cols-2 gap-2">
		<Label class="col-span-2 flex flex-col items-start">
			Search for foods
			<Input type="text" placeholder="apple pie" />
		</Label>
		<Button variant="secondary"><PlusCircleIcon /> Add manually</Button>
		<Button>Scan barcode <ScanBarcodeIcon /></Button>
	</Card.Content>
</Card.Root>

<Empty.Root>
	<Empty.Header>
		<Empty.Media variant="icon">
			<SearchIcon />
		</Empty.Media>
		<Empty.Title>No foods found</Empty.Title>
		<Empty.Description>Try another search or add the food manually</Empty.Description>
	</Empty.Header>
	<Empty.Content></Empty.Content>
</Empty.Root>
