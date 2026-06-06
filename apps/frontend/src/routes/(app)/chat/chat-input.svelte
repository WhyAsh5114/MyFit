<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Button } from '$lib/components/ui/button';
	import { CameraIcon, FileIcon, PlusIcon, SendIcon, XIcon } from '@lucide/svelte';
	import type { UIDataTypes, UIMessagePart, UITools } from 'ai';
	import imageCompression from 'browser-image-compression';

	interface Props {
		status: string;
		onsendmessage: (parts: UIMessagePart<UIDataTypes, UITools>[]) => void;
	}

	const { status, onsendmessage }: Props = $props();

	let input = $state('');
	let selectedImage = $state<{ dataUrl: string; mediaType: string } | null>(null);
	let fileInputEl: HTMLInputElement;
	let cameraInputEl: HTMLInputElement;

	const disabled = $derived(status !== 'ready' || (!input.trim() && !selectedImage));

	async function handleFileChange(event: Event) {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (!file) return;

		const compressed = await imageCompression(file, {
			maxSizeMB: 1,
			maxWidthOrHeight: 1024,
			useWebWorker: true
		});

		const reader = new FileReader();
		reader.onload = (e) => {
			selectedImage = {
				dataUrl: e.target?.result as string,
				mediaType: compressed.type || 'image/jpeg'
			};
		};
		reader.readAsDataURL(compressed);

		(event.target as HTMLInputElement).value = '';
	}

	function handleSubmit() {
		if (!input.trim() && !selectedImage) return;

		const parts: UIMessagePart<UIDataTypes, UITools>[] = [];

		if (selectedImage) {
			parts.push({
				type: 'file' as const,
				mediaType: selectedImage.mediaType,
				url: selectedImage.dataUrl
			});
		}

		if (input.trim()) {
			parts.push({ type: 'text' as const, text: input.trim() });
		}

		onsendmessage(parts);
		input = '';
		selectedImage = null;
	}
</script>

<input
	bind:this={cameraInputEl}
	type="file"
	accept="image/*"
	capture="environment"
	class="hidden"
	onchange={handleFileChange}
/>
<input
	bind:this={fileInputEl}
	type="file"
	accept="image/*"
	class="hidden"
	onchange={handleFileChange}
/>

{#if selectedImage}
	<div class="relative w-fit px-2 pt-2">
		<img src={selectedImage.dataUrl} alt="Selected" class="max-h-20 rounded-md object-cover" />
		<Button
			class="absolute top-0 right-0 size-6 rounded-full p-0.5 opacity-100 shadow"
			variant="destructive"
			onclick={() => (selectedImage = null)}
		>
			<XIcon class="size-3" />
		</Button>
	</div>
{/if}

<InputGroup.Root>
	<InputGroup.Textarea
		bind:value={input}
		placeholder="Ask, Search or Chat..."
		class="max-h-40"
		onkeydown={(event) => {
			if (event.key === 'Enter' && !event.shiftKey) {
				event.preventDefault();
				handleSubmit();
			}
		}}
	/>
	<InputGroup.Addon align="block-end">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<InputGroup.Button variant="outline" class="rounded-full" size="icon-sm" {...props}>
						<PlusIcon />
					</InputGroup.Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="start">
				<DropdownMenu.Group>
					<DropdownMenu.Item onclick={() => cameraInputEl.click()}>
						<CameraIcon /> Camera
					</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => fileInputEl.click()}>
						<FileIcon /> File
					</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>

		<InputGroup.Button
			variant="default"
			size="sm"
			class="ml-auto"
			onclick={handleSubmit}
			{disabled}
		>
			Send
			<SendIcon />
		</InputGroup.Button>
	</InputGroup.Addon>
</InputGroup.Root>
