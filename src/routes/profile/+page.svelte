<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import { trpc } from '$lib/trpc/client.js';
	import { TRPCClientError } from '@trpc/client';
	import { toast } from 'svelte-sonner';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { goto } from '$app/navigation';

	let { data } = $props();
	let migratingToV2 = $state(false);

	let bodyweight: number | undefined = $state();
	let duration: number | undefined = $state();

	async function migrateToV2(e: SubmitEvent) {
		e.preventDefault();
		if (!bodyweight || !duration) return;
		try {
			migratingToV2 = true;
			toast.warning("Don't close this window or reload the page");
			await trpc().users.migrateFromV2.mutate({ bodyweight, duration });
			await goto('/');
			migratingToV2 = false;
			toast.success('Migration completed successfully');
		} catch (error) {
			if (error instanceof TRPCClientError) {
				toast.error(error.message);
			}
		}
	}
</script>

<H2>Profile</H2>

<div class="mb-4 flex flex-col gap-4">
	<div class="flex flex-col">
		<span class="text-sm text-muted-foreground">Email</span>
		<span>{$page.data.session?.user?.email}</span>
	</div>

	<div class="flex flex-col">
		<span class="text-sm text-muted-foreground">Username</span>
		<span>{$page.data.session?.user?.name}</span>
	</div>
</div>

{#await data.V2Counts}
	<Skeleton class="h-40 w-full" />
{:then V2Counts}
	{#if V2Counts !== 'Migration has already been performed'}
		<Card.Root>
			<Card.Header>
				<Card.Title>V2 migration</Card.Title>
				<Card.Description>Get all your data from V2 into V3</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<p class="text-sm font-light">
					{#if typeof V2Counts === 'string'}
						{V2Counts}
					{:else}
						Email: <span class="font-semibold">{V2Counts.emailId}</span><br />
						Mesocycles: <span class="font-semibold">{V2Counts.mesocyclesCount}</span><br />
						Mesocycle Templates: <span class="font-semibold">{V2Counts.mesocycleTemplatesCount}</span><br />
						Workouts: <span class="font-semibold">{V2Counts.workoutsCount}</span>
					{/if}
				</p>

				<Separator />

				<form class="space-y-2" id="backfill-form" onsubmit={migrateToV2}>
					<p class="font-semibold">Enter averages to fill-in new V3 data</p>
					<div class="flex w-full max-w-sm flex-col gap-1.5">
						<Label for="bodyweight">Bodyweight</Label>
						<Input id="bodyweight" type="number" required placeholder="Type here" bind:value={bodyweight} />
					</div>
					<div class="flex w-full max-w-sm flex-col gap-1.5">
						<Label for="workout-duration">Workout duration</Label>
						<Input
							id="workout-duration"
							type="number"
							required
							placeholder="Type here (in minutes)"
							bind:value={duration}
						/>
					</div>
				</form>
			</Card.Content>
			<Card.Footer class="justify-between">
				<Button
					class="ml-auto gap-2"
					type="submit"
					form="backfill-form"
					disabled={typeof V2Counts === 'string' || migratingToV2}
				>
					{#if migratingToV2}
						Migrating, please wait <LoaderCircle class="animate-spin" />
					{:else}
						Start migration
					{/if}
				</Button>
			</Card.Footer>
		</Card.Root>
	{/if}
{/await}
