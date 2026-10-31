<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import * as Bubble from '#lib/components/ui/bubble/index.js';
	import Button from '#lib/components/ui/button/button.svelte';
	import * as Empty from '#lib/components/ui/empty/index.js';
	import * as Message from '#lib/components/ui/message/index.js';
	import * as MessageScroller from '#lib/components/ui/message-scroller/index.js';
	import Spinner from '#lib/components/ui/spinner/spinner.svelte';
	import { BotMessageSquareIcon } from '@lucide/svelte';
	import { chat } from './chat.svelte';
	import ChatMessage from './chat-message.svelte';
</script>

<MessageScroller.Provider autoScroll>
	<MessageScroller.Root class="h-auto grow basis-0">
		<MessageScroller.Viewport class="h-auto min-h-0 grow basis-0">
			<MessageScroller.Content class="gap-4 pb-2">
				{#each chat.messages as message, index (message.id)}
					<MessageScroller.Item messageId={message.id}>
						<ChatMessage {message} active={index === chat.messages.length - 1} />
					</MessageScroller.Item>
				{:else}
					<Empty.Root class="m-auto">
						<Empty.Header>
							<Empty.Media variant="icon">
								<BotMessageSquareIcon />
							</Empty.Media>
							<Empty.Title>{m['chat.greeting']()}</Empty.Title>
							<Empty.Description>
								{m['chat.greetingHint']()}
							</Empty.Description>
						</Empty.Header>
					</Empty.Root>
				{/each}
				{#if chat.status === 'error'}
					<Message.Root>
						<Message.Content>
							<Bubble.Root variant="destructive">
								<Bubble.Content>{m['chat.error']()}</Bubble.Content>
							</Bubble.Root>
							<Button class="w-fit" size="sm" variant="outline" onclick={() => chat.regenerate()}>
								{m['chat.tryAgain']()}
							</Button>
						</Message.Content>
					</Message.Root>
				{/if}
				{#if chat.status === 'submitted'}
					<Message.Root>
						<Message.Content>
							<Spinner class="text-muted-foreground" />
						</Message.Content>
					</Message.Root>
				{/if}
			</MessageScroller.Content>
		</MessageScroller.Viewport>
		<MessageScroller.Button />
	</MessageScroller.Root>
</MessageScroller.Provider>
