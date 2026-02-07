<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { setMode, userPrefersMode } from 'mode-watcher';
	import H1 from '$lib/components/typography/h1.svelte';
	import { m } from '$lib/paraglide/messages';

	let modeLabel = $derived(
		{
			light: m['settings.color_mode.light'](),
			dark: m['settings.color_mode.dark'](),
			system: m['settings.color_mode.system']()
		}[userPrefersMode.current]
	);
</script>

<H1>{m['settings.title']()}</H1>

<Card.Root>
	<Card.Header>
		<Card.Title>{m['settings.color_mode.title']()}</Card.Title>
		<Card.Description>{m['settings.color_mode.description']()}</Card.Description>
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
				<Select.Item value="light">{m['settings.color_mode.light']()}</Select.Item>
				<Select.Item value="dark">{m['settings.color_mode.dark']()}</Select.Item>
				<Select.Item value="system">{m['settings.color_mode.system']()}</Select.Item>
				</Select.Content>
			</Select.Root>
		</Card.Action>
	</Card.Header>
</Card.Root>
