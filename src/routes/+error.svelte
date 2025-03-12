<script>
	import FlickeringGrid from '$lib/components/magicui/flickering-grid.svelte';
	import H1 from '$lib/components/typography/h1.svelte';
	import { page } from '$app/state';
	import Button from '$lib/components/ui/button/button.svelte';
</script>

<div class="grid h-screen w-screen place-items-center">
	<FlickeringGrid
		class="col-start-1 row-start-1"
		squareSize={4}
		gridGap={6}
		color="--primary"
		maxOpacity={0.75}
		flickerChance={0.25}
	/>
	<div
		class="bg-background/75 z-10 col-start-1 row-start-1 flex h-fit w-full max-w-md flex-col items-center justify-center gap-8 rounded-lg p-4"
	>
		<div class="flex flex-col items-center">
			<img src="/favicon.ico" alt="MyFit Logo" class="-my-2 h-16 w-16" />
			<H1>MyFit</H1>
		</div>

		<div class="flex flex-col">
			<h2 class="text-center text-3xl font-bold">{page.status}</h2>
			<p class="text-center">{page.error?.message}</p>
		</div>

		<div class="grid grid-cols-2 gap-2">
			<Button href="/dashboard">Dashboard</Button>
			<Button href="/" variant="outline">Home</Button>
		</div>
	</div>
</div>
