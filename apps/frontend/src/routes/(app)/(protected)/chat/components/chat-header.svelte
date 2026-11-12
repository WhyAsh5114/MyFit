<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Button from '#lib/components/ui/button/button.svelte';
	import * as Drawer from '#lib/components/ui/drawer/index.js';
	import * as Empty from '#lib/components/ui/empty/index.js';
	import * as Item from '#lib/components/ui/item/index.js';
	import { shortDateFormatter } from '#lib/my-utils.js';
	import { cn } from '#lib/utils.js';
	import Spinner from '#lib/components/ui/spinner/spinner.svelte';
	import { useCreateChat } from '#lib/features/chat/chat/mutations/create.js';
	import { useDeleteChat } from '#lib/features/chat/chat/mutations/delete.js';
	import { HistoryIcon, MessagesSquareIcon, SquarePenIcon, Trash2Icon } from '@lucide/svelte';
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

<!-- Set apart from the conversation, which scrolls beneath it. -->
<div class="-mx-4 flex items-center gap-1 border-b px-4 pb-2">
	<h1 class="min-w-0 flex-1 truncate text-sm font-medium">
		{title ?? m['chat.newChatTitle']()}
	</h1>

	<Drawer.Root bind:open>
		<Drawer.Trigger>
			{#snippet child({ props })}
				<Button variant="ghost" size="icon" aria-label={m['chat.history']()} {...props}>
					<HistoryIcon />
				</Button>
			{/snippet}
		</Drawer.Trigger>
		<Drawer.Content>
			<Drawer.Header class="text-start">
				<Drawer.Title>{m['chat.history']()}</Drawer.Title>
				<Drawer.Description class="sr-only">{m['chat.historyDescription']()}</Drawer.Description>
			</Drawer.Header>
			<div class="flex max-h-[60dvh] flex-col gap-1 overflow-y-auto px-4 pb-4">
				{#each chats as chat (chat.id)}
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
					<Empty.Root>
						<Empty.Header>
							<Empty.Media variant="icon"><MessagesSquareIcon /></Empty.Media>
							<Empty.Title>{m['chat.noHistory']()}</Empty.Title>
						</Empty.Header>
					</Empty.Root>
				{/each}
			</div>
		</Drawer.Content>
	</Drawer.Root>

	<Button
		variant="ghost"
		size="icon"
		aria-label={m['chat.newChat']()}
		disabled={title === null}
		href={newChatHref()}
		onclick={() => posthog.capture('chat_reset')}
	>
		<SquarePenIcon />
	</Button>
</div>
