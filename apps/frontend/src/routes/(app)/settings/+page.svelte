<script lang="ts">
	import H1 from '$lib/components/typography/h1.svelte';
	import { m } from '$lib/paraglide/messages';
	import LocaleSwitcher from './components/locale-switcher.svelte';
	import ThemeSwitcher from './components/theme-switcher.svelte';
</script>

<H1>{m['settings.title']()}</H1>

<ThemeSwitcher />
<LocaleSwitcher />
