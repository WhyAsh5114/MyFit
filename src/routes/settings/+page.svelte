<script lang="ts">
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import BellRing from 'virtual:icons/lucide/bell-ring';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
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
			{#each settingsRunes.notifications as notification, idx (idx)}
				<div class="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
					<span class="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500"></span>
					<div class="space-y-1">
						<p class="text-sm font-medium leading-none">
							{notification.title}
						</p>
						<p class="text-sm text-muted-foreground">
							{notification.timestamp}
						</p>
					</div>
				</div>
			{:else}
				<div class="muted-text-box">No notifications to show</div>
			{/each}
		</div>
	</Card.Content>
</Card.Root>
