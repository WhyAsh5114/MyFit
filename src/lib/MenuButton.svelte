<script lang="ts">
    export let title: string;
    export let description: string;
    export let link: string;
    export let imagePath: string;
</script>

<a class="card cursor-pointer w-full bg-primary hover:bg-neutral shadow-xl transition-colors" href={link}>
	<figure class="pt-4 md:pt-7 lg:pt-10 w-full">
		<img src={imagePath} alt={imagePath} class="h-14 md:h-20 lg:h-24" />
	</figure>
	<div class="card-body p-2.5 sm:p-3 md:p-3.5 items-center text-center">
		<h2 class="card-title text-lg lg:text-xl">{title}</h2>
		<p class="text-sm lg:text-lg">{description}</p>
	</div>
</a>
