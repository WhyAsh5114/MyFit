<script lang="ts">
	import { page } from "$app/stores";
	const steps = ["basics", "split", "exercises", "overview"];
	let currentPageIndex = steps.findIndex((step) => $page.url.pathname.endsWith(step));
</script>

<ul class="steps bg-primary rounded-md py-1 mb-5">
	{#each steps as step, i}
		<li class="step capitalize {i <= currentPageIndex ? 'step-accent' : ''}">{step}</li>
	{/each}
</ul>

<slot />
