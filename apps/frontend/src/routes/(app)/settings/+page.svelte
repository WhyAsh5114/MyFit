<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { setMode, userPrefersMode } from 'mode-watcher';
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Color mode</Card.Title>
		<Card.Description>Select the color mode for the app</Card.Description>
		<Card.Action>
			<Select.Root
				type="single"
				value={userPrefersMode.current}
				onValueChange={(v) => setMode(v as 'light' | 'dark' | 'system')}
			>
				<Select.Trigger class="capitalize">
					{userPrefersMode.current}
				</Select.Trigger>
				<Select.Content align="end">
					<Select.Item value="light">Light</Select.Item>
					<Select.Item value="dark">Dark</Select.Item>
					<Select.Item value="system">System</Select.Item>
				</Select.Content>
			</Select.Root>
		</Card.Action>
	</Card.Header>
</Card.Root>
