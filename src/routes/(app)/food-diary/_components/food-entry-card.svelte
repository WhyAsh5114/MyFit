<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { client } from '$lib/idb-client';
	import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from '@lucide/svelte';
	import type { Prisma } from '$lib/generated/prisma/client';
	import { createMutation, type createQuery } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';

	type PropsType = {
		entry: Prisma.FoodEntryGetPayload<{ include: { nutritionData: true } }>;
		entriesQuery: ReturnType<typeof createQuery>;
	};
	let { entry, entriesQuery }: PropsType = $props();

	const deleteEntryMutation = createMutation(() => ({
		mutationFn: async (entryId: string) => {
			return await client.foodEntry.delete({ where: { id: entryId } });
		},
		onSuccess: () => {
			toast.success('Food entry deleted successfully');
			entriesQuery.refetch();
		},
		onError: (error) => {
			console.error('Error deleting food entry:', error);
			toast.error('Failed to delete food entry');
		}
	}));
</script>

<Card.Root class="py-4">
	<Card.Header class="px-4">
		<Card.Title>{entry.nutritionData?.product_name}</Card.Title>
		<Card.Description>
			{entry.quantity}g - {(
				entry.nutritionData!.energy_kcal_100g *
				(entry.quantity / 100)
			).toFixed()} cals
		</Card.Description>
		<Card.Action>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button variant="ghost" size="icon" {...props}>
							<EllipsisVerticalIcon />
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end">
					<DropdownMenu.Group>
						<DropdownMenu.Item
							onclick={() =>
								// eslint-disable-next-line svelte/no-navigation-without-resolve
								goto(`/food-diary/add/item?id=${entry.nutritionDataId}&edit=${entry.id}`)}
						>
							<PencilIcon /> Edit
						</DropdownMenu.Item>
						<DropdownMenu.Item
							class="text-red-500"
							onclick={() => deleteEntryMutation.mutate(entry.id)}
						>
							<TrashIcon /> Delete
						</DropdownMenu.Item>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</Card.Action>
	</Card.Header>
</Card.Root>
