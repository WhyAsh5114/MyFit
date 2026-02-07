<script>
	import { resolve } from '$app/paths';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as m from '$lib/paraglide/messages';
	import { BicepsFlexedIcon } from '@lucide/svelte';
</script>

<div class="flex h-screen w-screen items-center justify-center">
	<Button aria-label={m['home.openApp']()} class="size-36" href={resolve('/dashboard')}>
		<BicepsFlexedIcon class="size-24" strokeWidth={1.25} />
	</Button>
</div>
