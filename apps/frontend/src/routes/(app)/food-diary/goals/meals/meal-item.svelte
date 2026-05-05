<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import * as Item from '$lib/components/ui/item/index.js';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { GripVerticalIcon, TrashIcon } from '@lucide/svelte';
	import { m } from '$lib/paraglide/messages';
	import { cn } from '$lib/utils';

	type Props = {
		name: string;
		class?: string;
		gripAttachment?: Attachment<HTMLElement>;
		inputProps?: Omit<HTMLInputAttributes, 'type' | 'files'>;
		onchange?: (e: Event & { currentTarget: HTMLInputElement }) => void;
		onDelete?: () => void;
	};

	let { name, class: className, gripAttachment, inputProps = {}, onchange, onDelete }: Props =
		$props();
</script>

<Item.Root class={cn('bg-card p-2', className)}>
	<Item.Actions>
		<div {@attach gripAttachment}>
			<Button class="pointer-events-none" size="icon-sm" variant="secondary">
				<GripVerticalIcon class="size-4" />
			</Button>
		</div>
	</Item.Actions>
	<Item.Content>
		<Input
			type="text"
			{...inputProps}
			value={name}
			placeholder={m['foodDiary.mealNamePlaceholder']()}
			{onchange}
			readonly={!onchange}
		/>
	</Item.Content>
	<Item.Actions>
		<Button
			type="button"
			size="icon-sm"
			variant="destructive"
			class={cn({ 'pointer-events-none': !onDelete })}
			onclick={onDelete}
		>
			<TrashIcon />
		</Button>
	</Item.Actions>
</Item.Root>
