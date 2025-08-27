<script>
	import H1 from '$lib/components/typography/h1.svelte';
	import H2 from '$lib/components/typography/h2.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { ChevronRightCircleIcon } from '@lucide/svelte';
</script>

<H1>Create split</H1>
<H2>Choose template</H2>

<div class="flex grow flex-col"></div>

<Button href="/exercise-splits/create/basics">Start from scratch <ChevronRightCircleIcon /></Button>
