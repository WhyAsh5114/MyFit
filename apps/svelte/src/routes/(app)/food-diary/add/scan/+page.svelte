<script lang="ts">
	import H1 from '$lib/components/typography/h1.svelte';
	import H2 from '$lib/components/typography/h2.svelte';
	import H3 from '$lib/components/typography/h3.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { createQuery } from '@tanstack/svelte-query';
	import { BarqodeStream, type DetectedBarcode } from 'barqode';
	import {
		LoaderCircleIcon,
		PencilIcon,
		PlusIcon,
		RedoIcon,
		ScanTextIcon,
		SearchIcon
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { getFoodByCode } from '../../food.remote';

	let loading = $state(true);
	let paused = $state(false);
	let result = $state<string>();

	function onCameraOn() {
		loading = false;
	}

	function onDetect(detectedCodes: DetectedBarcode[]) {
		const value = detectedCodes.at(-1)?.rawValue;
		if (typeof value !== 'string') {
			toast.error('Detected code is not a valid number');
			return;
		}

		result = value;
		paused = true;
	}

	const barcodeQuery = createQuery(() => ({
		queryKey: ['barcode', result],
		queryFn: async () => {
			try {
				return await getFoodByCode({ code: result! });
			} catch (error) {
				toast.error('Failed to fetch food data');
				console.error('Error fetching food data:', error);
				return null;
			}
		},
		enabled: Boolean(result)
	}));
</script>

<H1>Food diary</H1>
<H2>Add food</H2>

<H3>Scan barcode</H3>

<div class="h-px grow rounded-md border">
	<BarqodeStream
		{onCameraOn}
		{onDetect}
		bind:paused
		formats={['upc_a', 'ean_13', 'ean_8']}
		onError={(err) => toast.error('An error occurred while scanning', { description: err.message })}
	>
		{#if loading}
			<div class="text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
				<LoaderCircleIcon size={128} strokeWidth={1} class="animate-spin" />
				<span>Loading</span>
			</div>
		{:else if result}
			<div
				class="bg-background/65 flex h-full flex-col items-center justify-center gap-2 backdrop-blur-sm"
			>
				<Card.Root class="w-11/12">
					<Card.Header>
						<Card.Title>Barcode detected</Card.Title>
						<Card.Description>{result}</Card.Description>
					</Card.Header>
					<Card.Content>
						{#if barcodeQuery.isLoading}
							<LoaderCircleIcon size={64} strokeWidth={1} class="animate-spin" />
						{:else if barcodeQuery.isError}
							<div class="text-muted-foreground">
								<span>Error fetching food data</span>
							</div>
						{:else if barcodeQuery.data}
							<div class="flex flex-col">
								<span class="text-lg">{barcodeQuery.data.product_name}</span>
								<span class="text-muted-foreground text-sm">
									{barcodeQuery.data.brands}
								</span>
							</div>
							<Button class="mt-4 w-full"><PlusIcon /> Add to diary</Button>
							<Button
								class="mt-2 w-full"
								variant="outline"
								onclick={() => {
									result = undefined;
									paused = false;
								}}
							>
								<RedoIcon /> Try again
							</Button>
						{:else}
							<div class="grid gap-2">
								<span>No food data found for this barcode</span>
								<Button class="justify-start">
									<ScanTextIcon />
									<p class="w-full">Scan nutrition table</p>
								</Button>
								<Button variant="outline" href="/food-diary/add">
									<SearchIcon />
									<p class="w-full text-center">Search using text</p>
								</Button>
								<Button class="justify-start" variant="outline">
									<PencilIcon />
									<p class="w-full">Add details manually</p>
								</Button>
								<Button
									class="justify-start"
									variant="outline"
									onclick={() => {
										result = undefined;
										paused = false;
									}}
								>
									<RedoIcon />
									<p class="w-full">Try again</p>
								</Button>
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			</div>
		{/if}
	</BarqodeStream>
</div>
