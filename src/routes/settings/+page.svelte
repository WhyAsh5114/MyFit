<script lang="ts">
	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';
	import { trpc } from '$lib/trpc/client';
	import Bug from 'virtual:icons/lucide/bug';
	import ClearIcon from 'virtual:icons/lucide/x';
	import * as Card from '$lib/components/ui/card';
	import { Switch } from '$lib/components/ui/switch';
	import { Button } from '$lib/components/ui/button';
	import { QuotesDisplayMode } from '@prisma/client';
	import BellRing from 'virtual:icons/lucide/bell-ring';
	import { settingsRunes } from './settingsRunes.svelte';
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import RefreshCcw from 'virtual:icons/lucide/refresh-ccw';
	import MotivationalQuotes from '$lib/components/settings/MotivationalQuotes.svelte';

	let hasError = $state(false);
	let quotesEnabled = $state(false);
	let quotesDisplayModes = $state<QuotesDisplayMode[]>(['PRE_WORKOUT']);

	$effect(() => {
		const userSettings = $page.data.userSettings;

		if (userSettings) {
			quotesDisplayModes = userSettings.quotesDisplayModes;
			quotesEnabled = userSettings.motivationalQuotesEnabled;

			hasError = false;
		} else if ($page.data.hasError) {
			hasError = true;
		}
	});

	function toggleShowNotifications(checked: boolean) {
		settingsRunes.pushNotificationsEnabled = checked;

		if (!checked) {
			settingsRunes.pushNotificationsEnabled = false;
			return;
		}

		if (Notification.permission !== 'granted') {
			Notification.requestPermission().then((result) => {
				settingsRunes.pushNotificationsEnabled = result === 'granted';
				if (result === 'denied') toast.error('Permission denied');
			});
		} else settingsRunes.pushNotificationsEnabled = true;
	}

	function clearAllNotifications() {
		try {
			settingsRunes.clearAllNotifications();
			toast.success('All notifications cleared');
		} catch (error) {
			console.error('Failed to clear notifications:', error);
			toast.error('Failed to clear notifications');
		}
	}

	const onUpdateSettings = async (enabled: boolean, modes?: QuotesDisplayMode[]) => {
		try {
			await trpc().users.updateUserSettings.mutate({
				motivationalQuotesEnabled: enabled,
				...(modes && { quotesDisplayModes: modes })
			});

			quotesEnabled = enabled;
			if (modes) quotesDisplayModes = modes;
		} catch (error) {
			console.error('Failed to update settings:', error);
			toast.error('Failed to update settings');
			throw error;
		}
	};
</script>

<H2>Settings</H2>

<div class="space-y-6">
	<Card.Root class="w-full">
		<Card.Header>
			<Card.Title>Notifications</Card.Title>
		</Card.Header>
		<Card.Content class="grid gap-4">
			<div class="flex items-center space-x-4 rounded-md border p-4">
				<BellRing />
				<div class="flex-1 space-y-1">
					<p class="text-sm font-medium leading-none">Push Notifications</p>
				</div>
				<Switch
					name="enable-push-notifications"
					checked={settingsRunes.pushNotificationsEnabled}
					onCheckedChange={toggleShowNotifications}
				/>
			</div>
			<div>
				{#each settingsRunes.notifications.toReversed() as notification, idx (idx)}
					<div class="mb-2 grid items-start pb-4 last:mb-0 last:pb-0">
						<div class="space-y-0.5">
							<div class="flex items-center justify-between">
								<p class="text-sm font-medium leading-none">
									{notification.title}
								</p>
								<Button
									class="h-5 w-5 p-0"
									onclick={() => {
										settingsRunes.deleteNotification(settingsRunes.notifications.length - idx - 1);
									}}
									variant="ghost"
								>
									<ClearIcon />
								</Button>
							</div>
							<p class="text-sm text-muted-foreground">
								{new Date(notification.timestamp).toLocaleString(undefined, {
									timeStyle: 'short',
									dateStyle: 'medium'
								})}
							</p>
						</div>
					</div>
				{:else}
					<div class="rounded-md bg-muted/50 p-4 text-center text-sm text-muted-foreground">
						No notifications to show
					</div>
				{/each}
			</div>
		</Card.Content>
		<Card.Footer>
			<Button class="w-full gap-2" onclick={clearAllNotifications}>
				Clear all <ClearIcon />
			</Button>
		</Card.Footer>
	</Card.Root>

	{#if hasError}
		<Card.Root class="w-full rounded-2xl border border-destructive bg-destructive/5 shadow-md">
			<Card.Header class="pb-2">
				<Card.Title class="flex items-center gap-2 text-lg font-semibold text-destructive">
					<Bug class="h-5 w-5" />
					Failed to Load Settings
				</Card.Title>
			</Card.Header>

			<Card.Content class="space-y-4">
				<p class="text-sm text-muted-foreground">
					We couldn't load your quote settings. You can try again or check your connection.
				</p>
				<Button
					variant="default"
					onclick={() => {
						hasError = false;
						window.location.reload();
					}}
				>
					<RefreshCcw class="mr-2 h-4 w-4" />
					Retry
				</Button>
			</Card.Content>
		</Card.Root>
	{:else}
		<MotivationalQuotes {quotesEnabled} {quotesDisplayModes} {onUpdateSettings} />
	{/if}
</div>
