<script>
	import AuroraText from '$lib/components/magicui/aurora-text.svelte';
	import Ripple from '$lib/components/magicui/ripple.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import { BicepsFlexedIcon } from '@lucide/svelte';
	import { fade } from 'svelte/transition';
</script>

<ScrollArea class="flex h-screen w-full flex-col items-center justify-center overflow-hidden py-6">
	<h1 class="text-center text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
		Most <AuroraText>comprehensive</AuroraText> fitness platform ever!
	</h1>
	<div
		class="relative mt-12 flex h-[500px] w-full flex-col items-center justify-center overflow-hidden"
		in:fade|global={{ delay: 1000 }}
	>
		<p
			class="text-foreground z-10 text-center text-5xl font-medium tracking-tighter whitespace-pre-wrap"
		>
			<Button class="h-24 w-24 rounded-xl p-0" href="/dashboard">
				<BicepsFlexedIcon class="!h-12 !w-12" />
			</Button>
		</p>
		<Ripple />
	</div>
</ScrollArea>
