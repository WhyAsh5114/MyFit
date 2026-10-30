<script lang="ts">
	import * as Attachment from '#lib/components/ui/attachment/index.js';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';
	import * as InputGroup from '#lib/components/ui/input-group/index.js';
	import Spinner from '#lib/components/ui/spinner/spinner.svelte';
	import { dev } from '$app/env';
	import {
		CameraIcon,
		ClipboardCopyIcon,
		FileIcon,
		PlusIcon,
		RotateCcwIcon,
		SendIcon,
		SquareIcon,
		XIcon
	} from '@lucide/svelte';
	import type { MyUIMessage } from '@myfit/api';
	import imageCompression from 'browser-image-compression';
	import posthog from 'posthog-js';
	import { toast } from 'svelte-sonner';
	import { chat, resetChat } from './chat.svelte';

	type Image = { name: string; mediaType: string; dataUrl?: string };

	let input = $state('');
	let image = $state<Image | null>(null);
	let fileInput: HTMLInputElement;
	let cameraInput: HTMLInputElement;

	const busy = $derived(chat.status === 'submitted' || chat.status === 'streaming');
	const canSend = $derived(!busy && (input.trim() !== '' || !!image?.dataUrl));

	async function attach(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		target.value = '';
		if (!file) return;

		image = { name: file.name, mediaType: file.type };
		try {
			const compressed = await imageCompression(file, {
				maxSizeMB: 1,
				maxWidthOrHeight: 1024,
				useWebWorker: true
			});
			const dataUrl = await new Promise<string>((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => resolve(reader.result as string);
				reader.onerror = () => reject(reader.error);
				reader.readAsDataURL(compressed);
			});
			image = { name: file.name, mediaType: compressed.type || 'image/jpeg', dataUrl };
			posthog.capture('chat_image_attached');
		} catch (error) {
			image = null;
			toast.error('Could not attach that image.');
			console.error('Failed to attach image:', error);
		}
	}

	function reset() {
		posthog.capture('chat_reset');
		resetChat();
	}

	function copyChat() {
		navigator.clipboard.writeText(JSON.stringify(chat.messages, null, 2));
		toast.success('Chat copied to clipboard');
	}

	function send() {
		if (!canSend) return;

		const parts: MyUIMessage['parts'] = [];
		if (image?.dataUrl) {
			parts.push({ type: 'file', mediaType: image.mediaType, url: image.dataUrl });
		}
		if (input.trim()) parts.push({ type: 'text', text: input.trim() });

		posthog.capture('chat_message_sent', {
			has_image: !!image,
			message_length: input.trim().length
		});
		chat.sendMessage({ role: 'user', parts });
		input = '';
		image = null;
	}
</script>

<input
	bind:this={cameraInput}
	type="file"
	accept="image/*"
	capture="environment"
	class="hidden"
	onchange={attach}
/>
<input bind:this={fileInput} type="file" accept="image/*" class="hidden" onchange={attach} />

<InputGroup.Root>
	{#if image}
		<InputGroup.Addon align="block-start">
			<Attachment.Root size="sm" state={image.dataUrl ? 'done' : 'processing'}>
				<Attachment.Media variant="image">
					{#if image.dataUrl}
						<img src={image.dataUrl} alt="" class="size-full object-cover" />
					{:else}
						<Spinner />
					{/if}
				</Attachment.Media>
				<Attachment.Content>
					<Attachment.Title class="max-w-40 truncate">{image.name}</Attachment.Title>
				</Attachment.Content>
				<Attachment.Actions>
					<Attachment.Action aria-label="Remove {image.name}" onclick={() => (image = null)}>
						<XIcon />
					</Attachment.Action>
				</Attachment.Actions>
			</Attachment.Root>
		</InputGroup.Addon>
	{/if}
	<InputGroup.Textarea
		bind:value={input}
		placeholder="Tell me what you ate..."
		class="max-h-40"
		onkeydown={(event) => {
			if (event.key === 'Enter' && !event.shiftKey) {
				event.preventDefault();
				send();
			}
		}}
	/>
	<InputGroup.Addon align="block-end">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<InputGroup.Button
						variant="outline"
						class="rounded-full"
						size="icon-sm"
						aria-label="Attach an image"
						{...props}
					>
						<PlusIcon />
					</InputGroup.Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="start">
				<DropdownMenu.Group>
					<DropdownMenu.Item onclick={() => cameraInput.click()}>
						<CameraIcon /> Camera
					</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => fileInput.click()}>
						<FileIcon /> File
					</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>

		<InputGroup.Button
			variant="ghost"
			size="icon-sm"
			aria-label="Start a new chat"
			disabled={chat.messages.length === 0}
			onclick={reset}
		>
			<RotateCcwIcon />
		</InputGroup.Button>
		{#if dev}
			<InputGroup.Button
				variant="ghost"
				size="icon-sm"
				aria-label="Copy chat"
				disabled={chat.messages.length === 0}
				onclick={copyChat}
			>
				<ClipboardCopyIcon />
			</InputGroup.Button>
		{/if}

		{#if busy}
			<InputGroup.Button
				class="ml-auto rounded-full"
				size="icon-sm"
				aria-label="Stop"
				onclick={() => chat.stop()}
			>
				<SquareIcon />
			</InputGroup.Button>
		{:else}
			<InputGroup.Button
				class="ml-auto rounded-full"
				size="icon-sm"
				aria-label="Send"
				disabled={!canSend}
				onclick={send}
			>
				<SendIcon />
			</InputGroup.Button>
		{/if}
	</InputGroup.Addon>
</InputGroup.Root>
