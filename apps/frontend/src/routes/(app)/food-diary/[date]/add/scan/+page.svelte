<script lang="ts">
	import { BarqodeStream, type DetectedBarcode } from 'barqode';
	import { toast } from 'svelte-sonner';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import Label from '$lib/components/ui/label/label.svelte';
	import { CameraIcon, FlashlightIcon } from '@lucide/svelte';
	import Switch from '$lib/components/ui/switch/switch.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

	let constraintOptions: { label: string; constraints: MediaTrackConstraints }[] = $state([]);
	let selectedConstraintsValue = $state<string>();
	let torch = $state(false);
	let torchSupported = $state<boolean>();

	async function onCameraOn(capabilities: MediaTrackCapabilities) {
		if (constraintOptions.length > 0) return;
		try {
			const devices = await navigator.mediaDevices.enumerateDevices();
			const videoDevices = devices.filter(({ kind }) => kind === 'videoinput');

			constraintOptions = videoDevices.map(({ deviceId, label }) => ({
				label: `${label}`,
				constraints: { deviceId }
			}));

			if (constraintOptions.length === 0) {
				toast.error('No cameras found');
				torchSupported = false;
			} else {
				selectedConstraintsValue = constraintOptions[0].label;
				torchSupported = !!(capabilities as MediaTrackCapabilities & { torch?: boolean[] }).torch;
			}
		} catch (e) {
			toast.error('Error accessing cameras');
			console.error(e);
			torchSupported = false;
		}
	}

	function onDetect(detectedCodes: DetectedBarcode[]) {
		const detectedCode = detectedCodes[0].rawValue;
		toast.success('Barcode detected', { description: `Value: ${detectedCode}` });
		goto(resolve(`/food-diary/${page.params.date}/add/${detectedCode}`));
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Scan barcode</Card.Title>
		<Card.Description>Select a camera and point it at a barcode</Card.Description>
	</Card.Header>
	<Card.Content class="grid grid-cols-3 gap-2">
		<Label class="col-span-2 flex flex-col items-start gap-2">
			<div class="flex items-center gap-2">
				<CameraIcon class="size-4" /> Select camera
			</div>
			{#if selectedConstraintsValue === undefined}
				<Skeleton class="h-9 w-full bg-secondary" />
			{:else}
				<Select.Root type="single" bind:value={selectedConstraintsValue}>
					<Select.Trigger class="w-full">
						<span class="truncate">
							{selectedConstraintsValue}
						</span>
					</Select.Trigger>
					<Select.Content align="start">
						{#each constraintOptions as option (option.label)}
							<Select.Item value={option.label}>
								{option.label}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			{/if}
		</Label>
		<Label class="flex flex-col items-start gap-2">
			<div class="flex items-center gap-2">
				<FlashlightIcon class="size-4" /> Torch
			</div>
			{#if torchSupported === undefined}
				<Skeleton class="h-9 w-full bg-secondary" />
			{:else}
				<div class="flex w-full items-center justify-between rounded-md border p-2">
					<Switch bind:checked={torch} disabled={!torchSupported} />
					{#if torchSupported}
						{torch ? 'On' : 'Off'}
					{:else}
						N/A
					{/if}
				</div>
			{/if}
		</Label>
	</Card.Content>
</Card.Root>

<BarqodeStream
	{onDetect}
	{onCameraOn}
	{torch}
	onError={(err) => toast.error('An error occurred while scanning', { description: err.message })}
	formats={['ean_13', 'ean_8', 'upc_a']}
/>
