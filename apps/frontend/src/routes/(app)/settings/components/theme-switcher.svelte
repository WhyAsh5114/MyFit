<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { setMode, userPrefersMode } from 'mode-watcher';
	import { m } from '$lib/paraglide/messages';

	let modeLabel = $derived(
		{
			light: m['themeSwitcher.light'](),
			dark: m['themeSwitcher.dark'](),
			system: m['themeSwitcher.system']()
		}[userPrefersMode.current]
	);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>{m['themeSwitcher.title']()}</Card.Title>
		<Card.Description>{m['themeSwitcher.description']()}</Card.Description>
		<Card.Action>
			<Select.Root
				type="single"
				value={userPrefersMode.current}
				onValueChange={(v) => setMode(v as 'light' | 'dark' | 'system')}
			>
				<Select.Trigger class="capitalize">
					{modeLabel}
				</Select.Trigger>
				<Select.Content align="end">
					<Select.Item value="light">{m['themeSwitcher.light']()}</Select.Item>
					<Select.Item value="dark">{m['themeSwitcher.dark']()}</Select.Item>
					<Select.Item value="system">{m['themeSwitcher.system']()}</Select.Item>
				</Select.Content>
			</Select.Root>
		</Card.Action>
	</Card.Header>
</Card.Root>
