<script lang="ts">
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import BellRing from 'virtual:icons/lucide/bell-ring';
	import ClearIcon from 'virtual:icons/lucide/x';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { settingsRunes } from './settingsRunes.svelte';
	import { toast } from 'svelte-sonner';

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
</script>

<H2>Settings</H2>

<Card.Root class="w-full">
	<Card.Header>
		<Card.Title>Notifications</Card.Title>
	</Card.Header>
	<Card.Content class="grid gap-4">
		<div class=" flex items-center space-x-4 rounded-md border p-4">
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
				<div class="muted-text-box">No notifications to show</div>
			{/each}
		</div>
	</Card.Content>
	<Card.Footer>
		<Button class="w-full gap-2">
			Clear all <ClearIcon />
		</Button>
	</Card.Footer>
</Card.Root>
