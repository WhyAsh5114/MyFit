<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
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
		SendIcon,
		SquareIcon,
		XIcon
	} from '@lucide/svelte';
	import type { MyUIMessage } from '@myfit/api';
	import imageCompression from 'browser-image-compression';
	import posthog from 'posthog-js';
	import { toast } from 'svelte-sonner';
	import { CHAT_IMAGE_URL_PREFIX } from '@myfit/shared/constants';
	import { useUploadChatImage } from '#lib/features/chat/chat-image/mutations/upload.js';
	import { getChatPageContext } from './chat.svelte';

	/** A photo being attached. `id` is set once object storage has it; the message refers to it by id. */
	type Image = { name: string; mediaType: string; previewUrl?: string; id?: string };

	const context = getChatPageContext();
	const chat = $derived(context.session.chat);
	const uploadImage = useUploadChatImage();

	let input = $state('');
	let image = $state<Image | null>(null);
	let fileInput: HTMLInputElement;
	let cameraInput: HTMLInputElement;

	const busy = $derived(chat.status === 'submitted' || chat.status === 'streaming');
	const canSend = $derived(!busy && !(image && !image.id) && (input.trim() !== '' || !!image?.id));

	/** Counts attaches, so a slow one that was replaced or removed doesn't overwrite the newer one. */
	let attachCount = 0;

	async function attach(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		target.value = '';
		if (!file) return;

		const attempt = ++attachCount;
		const current = () => attempt === attachCount && image !== null;
		image = { name: file.name, mediaType: file.type };
		try {
			const compressed = await imageCompression(file, {
				maxSizeMB: 1,
				maxWidthOrHeight: 1024,
				useWebWorker: true,
				fileType: 'image/jpeg'
			});
			if (!current()) return;
			image = {
				name: file.name,
				mediaType: 'image/jpeg',
				previewUrl: URL.createObjectURL(compressed)
			};
			const { id } = await uploadImage.mutateAsync(compressed);
			if (!current()) return;
			image = { ...image!, id };
			posthog.capture('chat_image_attached');
		} catch (error) {
			if (!current()) return;
			image = null;
			toast.error(m['chat.attachFailed']());
			console.error('Failed to attach image:', error);
		}
	}

	function copyChat() {
		navigator.clipboard.writeText(JSON.stringify(chat.messages, null, 2));
		toast.success(m['chat.copied']());
	}

	function send() {
		if (!canSend) return;

		const parts: MyUIMessage['parts'] = [];
		if (image?.id) {
			parts.push({
				type: 'file',
				mediaType: image.mediaType,
				url: `${CHAT_IMAGE_URL_PREFIX}${image.id}`
			});
		}
		if (input.trim()) parts.push({ type: 'text', text: input.trim() });

		posthog.capture('chat_message_sent', {
			has_image: !!image,
			message_length: input.trim().length
		});
		void context.session.send({ role: 'user', parts });
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
			<Attachment.Root size="sm" state={image.id ? 'done' : 'processing'}>
				<Attachment.Media variant="image">
					{#if image.previewUrl}
						<img src={image.previewUrl} alt="" class="size-full object-cover" />
					{:else}
						<Spinner />
					{/if}
				</Attachment.Media>
				<Attachment.Content>
					<Attachment.Title class="max-w-40 truncate">{image.name}</Attachment.Title>
				</Attachment.Content>
				<Attachment.Actions>
					<Attachment.Action
						aria-label="Remove {image.name}"
						onclick={() => {
							image = null;
							attachCount++;
						}}
					>
						<XIcon />
					</Attachment.Action>
				</Attachment.Actions>
			</Attachment.Root>
		</InputGroup.Addon>
	{/if}
	<InputGroup.Textarea
		bind:value={input}
		placeholder={m['chat.placeholder']()}
		class="max-h-40"
		onkeydown={(event) => {
			if (event.key === 'Enter' && !event.shiftKey) {
				event.preventDefault();
				send();
			}
		}}
	/>
	<InputGroup.Addon align="block-end" class="gap-3">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<InputGroup.Button
						variant="outline"
						class="rounded-full"
						size="icon-sm"
						aria-label={m['chat.attachImage']()}
						{...props}
					>
						<PlusIcon />
					</InputGroup.Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="start">
				<DropdownMenu.Group>
					<DropdownMenu.Item onclick={() => cameraInput.click()}>
						<CameraIcon />
						{m['chat.camera']()}
					</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => fileInput.click()}>
						<FileIcon />
						{m['chat.file']()}
					</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>

		{#if dev}
			<InputGroup.Button
				variant="ghost"
				size="icon-sm"
				aria-label={m['chat.copy']()}
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
				aria-label={m['chat.stop']()}
				onclick={() => chat.stop()}
			>
				<SquareIcon />
			</InputGroup.Button>
		{:else}
			<InputGroup.Button
				class="ml-auto rounded-full"
				size="icon-sm"
				aria-label={m['chat.send']()}
				disabled={!canSend}
				onclick={send}
			>
				<SendIcon />
			</InputGroup.Button>
		{/if}
	</InputGroup.Addon>
</InputGroup.Root>
