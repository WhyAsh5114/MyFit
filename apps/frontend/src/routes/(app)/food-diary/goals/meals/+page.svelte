<script lang="ts">
	import * as Item from '$lib/components/ui/item/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { flip } from 'svelte/animate';
	import { dragHandle, dragHandleZone, type DndEvent } from 'svelte-dnd-action';
	import { useCurrentUser } from '$lib/features/user/queries/get-current-user';
	import { useMeals } from '$lib/features/food-diary/meals/queries/get';
	import type { Meal } from '@myfit/api/prisma/client';
	import { Button } from '$lib/components/ui/button';
	import { GripVerticalIcon, PlusIcon, SaveIcon, TrashIcon } from '@lucide/svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { m } from '$lib/paraglide/messages';

	const flipDurationMs = 300;
	const user = useCurrentUser();
	const meals = useMeals(() => user.data?.id ?? '');

	let interactiveMeals = $derived(meals.data);

	function handleDndConsider(e: CustomEvent<DndEvent<Meal>>) {
		interactiveMeals = e.detail.items;
	}

	function handleDndFinalize(e: CustomEvent<DndEvent<Meal>>) {
		interactiveMeals = e.detail.items;
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>{m['foodDiary.mealsTitle']()}</Card.Title>
		<Card.Description>{m['foodDiary.mealsDescription']()}</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if interactiveMeals !== undefined}
			<div
				use:dragHandleZone={{
					items: interactiveMeals,
					flipDurationMs,
					dropTargetStyle: {},
					dropTargetClasses: ['bg-muted']
				}}
				onconsider={handleDndConsider}
				onfinalize={handleDndFinalize}
				class="flex flex-col gap-2 rounded-lg border p-2"
			>
				{#each interactiveMeals as meal (meal.id)}
					<div animate:flip={{ duration: flipDurationMs }}>
						<Item.Root class="bg-card p-2">
							<Item.Actions>
								<div use:dragHandle>
									<Button class="pointer-events-none" size="icon-sm" variant="secondary">
										<GripVerticalIcon class="size-4" />
									</Button>
								</div>
							</Item.Actions>
							<Item.Content>
								<Input type="text" value={meal.name} />
							</Item.Content>
							<Item.Actions>
								<Button size="icon-sm" variant="destructive">
									<TrashIcon />
								</Button>
							</Item.Actions>
						</Item.Root>
					</div>
				{/each}
			</div>
		{/if}
	</Card.Content>
	<Card.Footer>
		<Button class="w-full" variant="secondary">Add more <PlusIcon /></Button>
	</Card.Footer>
</Card.Root>

<Button class="mt-auto w-full">Save <SaveIcon /></Button>
