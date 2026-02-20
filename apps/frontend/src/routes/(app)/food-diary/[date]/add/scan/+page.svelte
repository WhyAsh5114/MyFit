<script lang="ts">
	import { BarqodeStream, type DetectedBarcode } from 'barqode';
	import { toast } from 'svelte-sonner';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { SearchIcon, ZapIcon, ZapOffIcon } from '@lucide/svelte';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { m } from '$lib/paraglide/messages';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import { pickBestCamera } from './utils';
	import Button from '$lib/components/ui/button/button.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { useNutritionDataByCode } from '$lib/features/food-diary/nutrition-data/queries/get-by-code';
	import Separator from '$lib/components/ui/separator/separator.svelte';

	let constraintOptions: { label: string; constraints: MediaTrackConstraints }[] = $state([]);
	let selectedConstraintsValue = $state<string>();
	let selectedConstraint = $derived(
		constraintOptions.find(({ label }) => label === selectedConstraintsValue)
	);

	let torch = $state(false);
	let torchSupported = $state<boolean>();

	let manualCode = $state<number>();
	let codeToSearch = $state('');

	const nutritionDataByCode = useNutritionDataByCode(() => codeToSearch);

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
			label: label.replace(/\s*\([^)]*\)$/, ''),
			constraints: { deviceId }
		}));

		selectedConstraintsValue = bestCamera.label.replace(/\s*\([^)]*\)$/, '');
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
		if (nutritionDataByCode.isSuccess && nutritionDataByCode.data) {
			if (nutritionDataByCode.data.length === 0) {
				toast.error(m['foodDiary.noItemFoundForCode']());
				return;
			}

			// Defaulting to first item in case multiple items are returned for the same code, which can happen with some APIs
			// Most of the time, barcodes will be unique. In the future, can add a dialog to let users choose if multiple items are returned.
			const nutritionData = nutritionDataByCode.data[0];
			goto(resolve(`/food-diary/${page.params.date}/add/${nutritionData.id}`));
		}
	});
</script>

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
	<div class="relative -mx-4 h-full w-screen grow">
		<BarqodeStream
			{onDetect}
			{onCameraOn}
			{torch}
			constraints={selectedConstraint?.constraints}
			onError={(err) =>
				toast.error('An error occurred while scanning', { description: err.message })}
			formats={['ean_13', 'ean_8', 'upc_a']}
		/>
		<Button
			class="absolute top-4 right-4 z-10 rounded-full"
			size="icon-lg"
			variant="secondary"
			aria-label="Toggle flashlight"
			onclick={() => (torch = !torch)}
			disabled={!torchSupported}
		>
			{#if torch}
				<ZapIcon />
			{:else}
				<ZapOffIcon />
			{/if}
		</Button>
		
		<svg
			class="absolute left-1/2 top-[calc(50%+36px)] -translate-x-1/2 -translate-y-1/2 w-48 h-48 pointer-events-none"
			viewBox="0 0 200 200"
			xmlns="http://www.w3.org/2000/svg"
		>
			<style>
				@keyframes scan {
					0% { transform: translateY(-80px); opacity: 0; }
					50% { opacity: 1; }
					100% { transform: translateY(80px); opacity: 0; }
				}
				.scan-line {
					animation: scan 2s infinite;
				}
			</style>
			
			<!-- Corner brackets -->
			<g stroke="currentColor" stroke-width="2" fill="none" class="text-foreground">
				<!-- Top-left corner -->
				<path d="M 20 40 L 20 60 M 20 40 L 45 40" />
				<!-- Top-right corner -->
				<path d="M 180 40 L 180 60 M 180 40 L 155 40" />
				<!-- Bottom-left corner -->
				<path d="M 20 160 L 20 140 M 20 160 L 45 160" />
				<!-- Bottom-right corner -->
				<path d="M 180 160 L 180 140 M 180 160 L 155 160" />
			</g>
			
			<!-- Scanning line -->
			<line x1="20" y1="100" x2="180" y2="100" stroke="currentColor" stroke-width="2" class="scan-line text-primary" opacity="0.6" />
		</svg>
	</div>
{/if}

<Card.Root class="z-10 -mx-4 -my-4 rounded-none">
	<Card.Content>
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
	<Separator class="my-4" />
		<form class="contents" onsubmit={handleManualCodeSubmit}>
			<InputGroup.Root>
				<InputGroup.Addon>
					<SearchIcon />
				</InputGroup.Addon>
				<InputGroup.Input
					type="number"
					placeholder="Enter code manually"
					required
					bind:value={manualCode}
				disabled={nutritionDataByCode.isFetching}
			/>
				<InputGroup.Addon align="inline-end">
					<InputGroup.Button
						variant="secondary"
						type="submit"
						aria-label="Submit manual code"
						disabled={nutritionDataByCode.isFetching}
					>
						{#if nutritionDataByCode.isFetching}
							<Spinner />
						{:else}
							Search
						{/if}
					</InputGroup.Button>
				</InputGroup.Addon>
			</InputGroup.Root>
		</form>
	</Card.Content>
</Card.Root>
