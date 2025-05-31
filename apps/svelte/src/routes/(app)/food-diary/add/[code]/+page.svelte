<script lang="ts">
	import { page } from '$app/state';
	import H2 from '$lib/components/typography/h2.svelte';
	import type { NutritionData } from '@prisma/client';
	import { createQuery } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';

	const foodQuery = createQuery({
		queryKey: ['food', page.params.code],
		queryFn: async () => {
			try {
				const response = await fetch(`/api/food/${page.params.code}`);
				if (!response.ok) throw new Error('Error occurred while fetching food data');
				return (await response.json()) as Omit<NutritionData, 'code'> & { code: string };
			} catch (error) {
				toast.error('Error fetching food data');
				console.error('Error fetching food data:', error);
				throw error;
			}
		}
	});
</script>

<H2>Add food</H2>
{#if $foodQuery.isLoading}
  <div class="text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
    <span>Loading...</span>
  </div>
{:else if $foodQuery.isError}
  <div class="text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
    <span>Error loading food data</span>
  </div>
{:else if $foodQuery.data}
  <div class="flex flex-col gap-4">
    <h3 class="text-lg font-semibold">{$foodQuery.data.product_name}</h3>
    <p>Calories: {$foodQuery.data.energy_kcal_100g}</p>
    <p>Protein: {$foodQuery.data.proteins_100g}g</p>
    <p>Carbs: {$foodQuery.data.carbohydrates_100g}g</p>
    <p>Fat: {$foodQuery.data.fat_100g}g</p>
  </div>
{/if}
