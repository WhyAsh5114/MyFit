<script lang="ts">
	import { page } from "$app/stores";
	const steps = ["basics", "split", "exercises", "specialization"];
	$: currentPageIndex = steps.findIndex((step) => $page.url.pathname.endsWith(step));
</script>

<ul class="steps bg-primary rounded-md py-1">
	{#each steps as step, i}
		<li class="step capitalize {i <= currentPageIndex ? 'step-accent' : ''}">{step}</li>
	{/each}
</ul>

<slot />
