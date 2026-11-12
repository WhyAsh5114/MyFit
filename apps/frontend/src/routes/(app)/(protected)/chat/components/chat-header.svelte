<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Button from '#lib/components/ui/button/button.svelte';
	import * as Popover from '#lib/components/ui/popover/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Empty from '#lib/components/ui/empty/index.js';
	import * as Item from '#lib/components/ui/item/index.js';
	import { shortDateFormatter } from '#lib/my-utils.js';
	import { cn } from '#lib/utils.js';
	import Spinner from '#lib/components/ui/spinner/spinner.svelte';
	import { useCreateChat } from '#lib/features/chat/chat/mutations/create.js';
	import { useDeleteChat } from '#lib/features/chat/chat/mutations/delete.js';
	import {
		ChevronsUpDownIcon,
		MessagesSquareIcon,
		SquarePenIcon,
		Trash2Icon
	} from '@lucide/svelte';
	import posthog from 'posthog-js';
	import { toast } from 'svelte-sonner';
	import { forgetChat, getChatPageContext } from './chat.svelte';

	type Props = {
		chats: { id: string; title: string; updatedAt: Date }[];
		/** The open chat's title, or `null` while it has no saved message. */
		title: string | null;
	};
	let { chats, title }: Props = $props();

	let open = $state(false);
	let query = $state('');
	const shown = $derived(
		chats.filter((chat) => chat.title.toLowerCase().includes(query.trim().toLowerCase()))
	);
	// A fresh search each time it opens.
	$effect(() => {
		if (!open) query = '';
	});
	const currentId = $derived(page.params.id);

	const context = getChatPageContext();
	const deleteChat = useDeleteChat();
	const createChat = useCreateChat();
	/** The chat being deleted, for its button's spinner. */
	let deletingId = $state<string | null>(null);

	const chatHref = (id: string) => resolve('/(app)/(protected)/chat/[id]', { id });
	/** A new conversation gets its id now and is saved with its first message. */
	const newChatHref = () => chatHref(crypto.randomUUID());

	async function remove(id: string) {
		const wasOpen = id === currentId;
		deletingId = id;
		let deleted;
		try {
			// Before the write, so a response still streaming into it can't save it back.
			if (wasOpen) forgetChat(id);
			deleted = await deleteChat.mutateAsync({ userId: context.session.userId, id });
		} catch {
			return; // The mutation showed a toast.
		} finally {
			deletingId = null;
		}
		posthog.capture('chat_deleted');
		if (wasOpen) {
			open = false;
			await goto(newChatHref(), { replaceState: true });
		}
		if (!deleted) return;
		toast(m['chat.deleted'](), {
			action: {
				label: m['common.undo'](),
				onClick: async () => {
					await createChat.mutateAsync(deleted).catch(() => {});
					if (wasOpen) await goto(chatHref(id));
				}
			}
		});
	}
</script>

<!-- One row: the open chat's title picks another chat, beside the new chat button. -->
<div class="flex items-center gap-2">
	<Popover.Root bind:open>
		<Popover.Trigger class="min-w-0 flex-1 justify-between font-medium">
			{#snippet child({ props })}
				<Button variant="outline" aria-label={m['chat.history']()} {...props}>
					<span class="truncate">{title ?? m['chat.newChatTitle']()}</span>
					<ChevronsUpDownIcon class="text-muted-foreground" />
				</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content
			align="start"
			class="w-(--bits-popover-anchor-width) max-w-[calc(100vw-2rem)] gap-2 p-2"
		>
			<Input
				type="search"
				bind:value={query}
				placeholder={m['chat.searchHistory']()}
				aria-label={m['chat.searchHistory']()}
			/>
			<div class="flex max-h-[50dvh] flex-col overflow-y-auto">
				{#each shown as chat (chat.id)}
					<Item.Root
						size="sm"
						class={cn('relative min-h-11 py-0 pe-0', { 'bg-muted': chat.id === currentId })}
					>
						<Item.Content class="min-w-0 py-2">
							<!-- The link covers the row; the delete button sits above it. -->
							<a
								href={chatHref(chat.id)}
								aria-current={chat.id === currentId ? 'page' : undefined}
								onclick={() => (open = false)}
								class="truncate font-medium after:absolute after:inset-0"
							>
								{chat.title}
							</a>
							<Item.Description class="text-xs tabular-nums">
								{shortDateFormatter.format(chat.updatedAt)}
							</Item.Description>
						</Item.Content>
						<Item.Actions>
							<Button
								variant="ghost"
								size="icon"
								class="relative z-10 size-11 text-muted-foreground"
								aria-label={m['chat.delete']({ title: chat.title })}
								disabled={deletingId !== null}
								onclick={() => remove(chat.id)}
							>
								{#if deletingId === chat.id}<Spinner />{:else}<Trash2Icon />{/if}
							</Button>
						</Item.Actions>
					</Item.Root>
				{:else}
					<Empty.Root class="p-4">
						<Empty.Header>
							<Empty.Media variant="icon"><MessagesSquareIcon /></Empty.Media>
							<Empty.Title>
								{chats.length === 0 ? m['chat.noHistory']() : m['chat.noMatches']()}
							</Empty.Title>
						</Empty.Header>
					</Empty.Root>
				{/each}
			</div>
		</Popover.Content>
	</Popover.Root>

	<Button
		variant="outline"
		size="icon"
		aria-label={m['chat.newChat']()}
		disabled={title === null}
		href={newChatHref()}
		onclick={() => posthog.capture('chat_reset')}
	>
		<SquarePenIcon />
	</Button>
</div>
