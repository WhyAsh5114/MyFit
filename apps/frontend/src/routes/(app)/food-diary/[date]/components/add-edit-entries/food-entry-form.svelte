<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import {
		ChevronDownIcon,
		ClockIcon,
		FolderPenIcon,
		HexagonIcon,
		WeightTildeIcon
	} from '@lucide/svelte';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { superForm, defaults, dateProxy, type SuperForm } from 'sveltekit-superforms';
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';
	import {
		foodEntryFormSchema,
		type FoodEntryFormSchema
	} from '$lib/features/food-diary/food-entry/food-entry.schema';
	import ModifyNutritionalInfoSheet from './modify-nutritional-info-sheet.svelte';
	import { toast } from 'svelte-sonner';
	import { m } from '$lib/paraglide/messages';
	import FoodCard from './food-card.svelte';
	import type { Snippet } from 'svelte';
	import { round } from '$lib/my-utils';
	import { cn } from '$lib/utils';

	type Props = {
		initialData?: FoodEntryFormSchema;
		formId: string;
		onSubmit: (data: FoodEntryFormSchema) => Promise<void>;
		submit: Snippet<[{ form: SuperForm<FoodEntryFormSchema> }]>;
		allowProductEdit: boolean;
	};
	let { initialData, onSubmit, submit, allowProductEdit, formId }: Props = $props();

	// svelte-ignore state_referenced_locally
	const form = superForm(
		defaults(
			initialData ? foodEntryFormSchema.parse(initialData) : undefined,
			zod4(foodEntryFormSchema)
		),
		{
			SPA: true,
			validators: zod4Client(foodEntryFormSchema),
			onUpdate: async ({ form }) => {
				if (!form.valid) return toast.error(m['errors.formInvalid']());
				await onSubmit(form.data);
			}
		}
	);

	const eatenAt = dateProxy(form, 'eatenAt', {
		format: 'datetime-local'
	});

	const { form: formData, enhance } = form;

	let hasServingData = $derived(
		!!$formData.servingSize && !!$formData.servingQuantity && $formData.servingQuantity > 0
	);

	let displayQuantityG = $derived.by(() => {
		if (($formData.quantityG as unknown) === '') return '';
		if ($formData.preferredUnit === 'g') return round($formData.quantityG);
		if ($formData.servingQuantity) return round($formData.quantityG / $formData.servingQuantity);
		return round($formData.quantityG);
	});

	function handleQuantityGChange(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		const value = e.currentTarget.valueAsNumber;
		if (!Number.isFinite(value)) return;

		if (value <= 0) {
			$formData.quantityG = 0;
			return;
		}

		if ($formData.preferredUnit === 'g') {
			$formData.quantityG = value;
		} else if ($formData.servingQuantity) {
			$formData.quantityG = value * $formData.servingQuantity;
		}
	}
</script>

<form use:enhance id={formId} class="contents">
	<Card.Root>
		<Card.Header>
			<Card.Title>{$formData.productName === '' ? 'No name' : $formData.productName}</Card.Title>
			<Card.Description>{$formData.brands ?? 'No brand'}</Card.Description>
			<Card.Action>
				<ModifyNutritionalInfoSheet {form} />
			</Card.Action>
		</Card.Header>
		<FoodCard food={$formData} quantityG={$formData.quantityG} />
		<Card.Content class="grid grid-cols-2 gap-2">
			{#if allowProductEdit}
				<Form.Field {form} name="productName">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>
								<FolderPenIcon class="size-4" />
								{m['foodDiary.entryProductName']()}
							</Form.Label>
							<InputGroup.Root>
								<InputGroup.Input {...props} type="text" bind:value={$formData.productName} />
							</InputGroup.Root>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="brands">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>
								<HexagonIcon class="size-4" />
								{m['foodDiary.entryBrands']()}
							</Form.Label>
							<InputGroup.Root>
								<InputGroup.Input {...props} type="text" bind:value={$formData.brands} />
							</InputGroup.Root>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			{/if}
			<Form.Field {form} name="quantityG" class="col-span-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>
							<WeightTildeIcon class="size-4" />
							{m['foodDiary.entryQuantity']()}
						</Form.Label>
						<InputGroup.Root>
							<InputGroup.Input
								{...props}
								type="number"
								step={0.01}
								value={displayQuantityG}
								oninput={handleQuantityGChange}
							/>
							<InputGroup.Addon align="inline-end">
								{#if hasServingData}
									<DropdownMenu.Root>
										<DropdownMenu.Trigger class="flex items-center gap-2">
											{$formData.preferredUnit}
											<ChevronDownIcon class="size-4" />
										</DropdownMenu.Trigger>
										<DropdownMenu.Content align="end">
											<DropdownMenu.Item onclick={() => ($formData.preferredUnit = 'g')}>
												g
											</DropdownMenu.Item>
											<DropdownMenu.Item onclick={() => ($formData.preferredUnit = 'serving')}>
												serving <p class="text-sm text-muted-foreground">{$formData.servingSize}</p>
											</DropdownMenu.Item>
										</DropdownMenu.Content>
									</DropdownMenu.Root>
								{:else}
									g
								{/if}
							</InputGroup.Addon>
						</InputGroup.Root>
					{/snippet}
				</Form.Control>
				{#if hasServingData && $formData.servingQuantity}
					<Form.Description>
						{#if $formData.preferredUnit === 'g'}
							{@const servings = round($formData.quantityG / $formData.servingQuantity)}
							≈ {servings}
							{servings === 1 ? 'serving' : 'servings'}
							<br />
						{/if}
						<p class={cn({ 'text-xs': $formData.preferredUnit === 'g' })}>
							1 serving = {$formData.servingSize}
						</p>
					</Form.Description>
				{/if}
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="eatenAt" class="col-span-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>
							<ClockIcon class="size-4" />
							{m['foodDiary.entryEatenAt']()}
						</Form.Label>
						<Input {...props} type="datetime-local" bind:value={$eatenAt} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		</Card.Content>
	</Card.Root>

	{@render submit({ form })}
</form>
