<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { m } from '$lib/paraglide/messages.js';
	import { getLocale, setLocale, locales } from '$lib/paraglide/runtime.js';

	type Locale = (typeof locales)[number];

	function isValidLocale(locale: unknown): locale is Locale {
		return typeof locale === 'string' && locales.includes(locale as Locale);
	}

	function changeLocale(locale: unknown) {
		if (!isValidLocale(locale)) return;
		setLocale(locale);
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>{m['localeSwitcher.label']()}</Card.Title>
		<Card.Description>{m['localeSwitcher.description']()}</Card.Description>
		<Card.Action>
			<Select.Root type="single" value={getLocale()} onValueChange={changeLocale}>
				<Select.Trigger class="capitalize">
					{m[`language.${getLocale()}`]()}
				</Select.Trigger>
				<Select.Content align="end">
					<Select.Item value="en">{m['language.en']()}</Select.Item>
					<Select.Item value="es">{m['language.es']()}</Select.Item>
				</Select.Content>
			</Select.Root>
		</Card.Action>
	</Card.Header>
</Card.Root>
