<script lang="ts">
	export let mainCircleSize: number = 210;
	export let mainCircleOpacity: number = 0.24;
	export let numCircles: number = 8;
	export { className as class };

	let className = '';
</script>

<div
	class={`absolute inset-0 flex items-center justify-center [mask-image:linear-gradient(to_bottom,white,transparent)] ${className}`}
>
	<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
	{#each { length: numCircles } as _, i (i)}
		<div
			class="animate-ripple bg-foreground/30 absolute top-1/2 bottom-1/2 right-1/2 left-1/2 rounded-full border shadow-xl [--i:{i}]"
			style="width: {mainCircleSize + i * 70}px;
         height: {mainCircleSize + i * 70}px;
         opacity: {mainCircleOpacity - i * 0.03}; 
         animation-delay: {i * 0.08}s;
         border-style:{i === numCircles - 1 ? 'dashed' : 'solid'};
         border-width: 1px;
         border-color: rgba(var(--foreground-rgb), {(5 + i * 5) / 100});
        "
		></div>
	{/each}
</div>

<!-- 

 -->
