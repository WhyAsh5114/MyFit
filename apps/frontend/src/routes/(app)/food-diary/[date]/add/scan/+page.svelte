<script lang="ts">
	import { BarqodeStream, type DetectedBarcode } from 'barqode';
	import { toast } from 'svelte-sonner';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import Label from '$lib/components/ui/label/label.svelte';
	import { CameraIcon, FlashlightIcon, SearchIcon } from '@lucide/svelte';
	import Switch from '$lib/components/ui/switch/switch.svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { m } from '$lib/paraglide/messages';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import { pickBestCamera } from './utils';
	import Input from '$lib/components/ui/input/input.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { useGetNutritionDataByCodeQuery } from '$lib/features/food-diary/nutrition-data/get-nutrition-data-by-code';

	let constraintOptions: { label: string; constraints: MediaTrackConstraints }[] = $state([]);
	let selectedConstraintsValue = $state<string>();
	let selectedConstraint = $derived(
		constraintOptions.find(({ label }) => label === selectedConstraintsValue)
	);

	let torch = $state(false);
	let torchSupported = $state<boolean>();

	let manualCode = $state<number>();
	let codeToSearch = $state('');

	const getNutritionDataByCodeQuery = useGetNutritionDataByCodeQuery(() => codeToSearch);

	async function initializeCameraOptions() {
		await navigator.mediaDevices.getUserMedia({ video: true });
		const devices = await navigator.mediaDevices.enumerateDevices();
		const videoDevices = devices.filter(({ kind }) => kind === 'videoinput');

		if (videoDevices.length === 0) {
			toast.error(m['foodDiary.noCamerasFound']());
			return false;
		}

		const bestCamera = await pickBestCamera(videoDevices);

		constraintOptions = videoDevices.map(({ deviceId, label }) => ({
			label,
			constraints: { deviceId }
		}));

		selectedConstraintsValue = bestCamera.label;
		return true;
	}

	$effect(() => {
		initializeCameraOptions().catch((e) => {
			toast.error(m['foodDiary.cameraAccessError']());
			console.error(e);
		});
	});

	function onCameraOn(capabilities: MediaTrackCapabilities) {
		torchSupported = 'torch' in capabilities;
	}

	function onDetect(detectedCodes: DetectedBarcode[]) {
		const detectedCode = detectedCodes[0].rawValue;
		toast.success(m['foodDiary.barcodeDetected'](), {
			description: m['foodDiary.barcodeDetectedValue']({ value: detectedCode })
		});
		codeToSearch = detectedCode;
	}

	function handleManualCodeSubmit(e: Event) {
		e.preventDefault();
		if (!manualCode) return;
		codeToSearch = manualCode.toString();
	}

	$effect(() => {
		if (getNutritionDataByCodeQuery.isSuccess && getNutritionDataByCodeQuery.data) {
			if (getNutritionDataByCodeQuery.data.length === 0) {
				toast.error(m['foodDiary.noItemFoundForCode']());
				return;
			}

			// Defaulting to first item in case multiple items are returned for the same code, which can happen with some APIs
			// Most of the time, barcodes will be unique. In the future, can add a dialog to let users choose if multiple items are returned.
			const nutritionData = getNutritionDataByCodeQuery.data[0];
			goto(resolve(`/food-diary/${page.params.date}/add/${nutritionData.id}`));
		}
	});
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>{m['foodDiary.scanBarcodeTitle']()}</Card.Title>
		<Card.Description>{m['foodDiary.scanBarcodeDescription']()}</Card.Description>
	</Card.Header>
	<Card.Content class="grid grid-cols-3 gap-2">
		<Label class="col-span-2 flex flex-col items-start gap-2">
			<div class="flex items-center gap-2">
				<CameraIcon class="size-4" />
				{m['foodDiary.selectCamera']()}
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
				<FlashlightIcon class="size-4" />
				{m['foodDiary.torchLabel']()}
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
	<Card.Footer>
		<form class="contents" onsubmit={handleManualCodeSubmit}>
			<Label class="flex w-full flex-col items-start gap-2">
				Enter code manually
				<div class="flex w-full gap-2">
					<Input
						type="number"
						placeholder="Type code here"
						required
						bind:value={manualCode}
						disabled={getNutritionDataByCodeQuery.isFetching}
					/>
					<Button
						variant="outline"
						type="submit"
						size="icon"
						aria-label="Submit manual code"
						disabled={getNutritionDataByCodeQuery.isFetching}
					>
						{#if getNutritionDataByCodeQuery.isFetching}
							<Spinner />
						{:else}
							<SearchIcon />
						{/if}
					</Button>
				</div>
			</Label>
		</form>
	</Card.Footer>
</Card.Root>

{#if selectedConstraintsValue === undefined}
	<Empty.Root class="h-full">
		<Empty.Header>
			<Empty.Media variant="icon">
				<Spinner />
			</Empty.Media>
			<Empty.Title>
				{m['foodDiary.initializingCamera']()}
			</Empty.Title>
			<Empty.Description>
				{m['foodDiary.initializingCameraDescription']()}
			</Empty.Description>
		</Empty.Header>
	</Empty.Root>
{:else}
	<BarqodeStream
		{onDetect}
		{onCameraOn}
		{torch}
		constraints={selectedConstraint?.constraints}
		onError={(err) => toast.error('An error occurred while scanning', { description: err.message })}
		formats={['ean_13', 'ean_8', 'upc_a']}
	/>
{/if}
