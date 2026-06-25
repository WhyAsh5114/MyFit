<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Button } from '$lib/components/ui/button';
	import {
		CameraIcon,
		ClipboardCopyIcon,
		FileIcon,
		PlusIcon,
		RotateCcwIcon,
		SendIcon,
		XIcon
	} from '@lucide/svelte';
	import imageCompression from 'browser-image-compression';
	import { toast } from 'svelte-sonner';
	import { chat, resetChat } from './chat.svelte';
	import type { MyUIMessage } from '@myfit/api';
	import { dev } from '$app/environment';
	import posthog from 'posthog-js';

	let input = $state('');
	let selectedImage = $state<{ dataUrl: string; mediaType: string } | null>(null);
	let fileInputEl: HTMLInputElement;
	let cameraInputEl: HTMLInputElement;

	const disabled = $derived(chat.status !== 'ready' || (!input.trim() && !selectedImage));

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
			posthog.capture('chat_image_attached');
		};
		reader.readAsDataURL(compressed);

		(event.target as HTMLInputElement).value = '';
	}

	function handleReset() {
		posthog.capture('chat_reset');
		resetChat();
	}

	function copyChat() {
		navigator.clipboard.writeText(JSON.stringify(chat.messages, null, 2));
		toast.success('Chat copied to clipboard');
	}

	function handleSubmit() {
		if (!input.trim() && !selectedImage) return;

		const parts: MyUIMessage['parts'] = [];

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

		posthog.capture('chat_message_sent', {
			has_image: !!selectedImage,
			message_length: input.trim().length
		});
		chat.sendMessage({ role: 'user', parts });
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
			class="absolute top-0 right-0 size-6 rounded-full border p-0.5 shadow"
			variant="secondary"
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
			if (event.key === 'Enter' && !event.shiftKey && !disabled) {
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
			variant="ghost"
			size="icon-sm"
			disabled={chat.messages.length === 0}
			onclick={handleReset}
		>
			<RotateCcwIcon />
		</InputGroup.Button>
		{#if dev}
			<InputGroup.Button
				variant="ghost"
				size="icon-sm"
				disabled={chat.messages.length === 0}
				onclick={copyChat}
			>
				<ClipboardCopyIcon />
			</InputGroup.Button>
		{/if}

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
