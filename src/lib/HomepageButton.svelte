<script lang="ts">
    export let title: string;
    export let link: string;
</script>

<a
    class="card btn normal-case cursor-pointer w-full bg-primary hover:bg-neutral shadow-xl transition-colors h-fit"
    href={link}
>
    <figure class="pt-4 md:pt-7 lg:pt-10 w-full">
        <slot />
    </figure>
    <div class="card-body p-2.5 sm:p-3 md:p-3.5 items-center text-center">
        <h2 class="card-title text-lg lg:text-xl">{title}</h2>
    </div>
</a>
