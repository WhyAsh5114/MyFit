<script lang="ts">
    export let title: string;
    export let description: string | undefined = undefined;
    export let link: string;
    export let disabled = false;
    export let onClick = () => {};
</script>

<a
    class={`flex btn p-0 normal-case cursor-pointer rounded-xl w-full bg-primary hover:bg-neutral shadow-xl transition-colors h-full pr-2 ${
        disabled ? 'my-disabled-button' : ''
    }`}
    href={link}
    on:click={onClick}
>
    <div class="flex w-1/3 lg:w-2/5 justify-center items-center py-4">
        <slot />
    </div>
    <div class="flex flex-col justify-center p-2.5 sm:p-3 md:p-3.5 w-2/3 lg:w-3/5">
        <h2 class="card-title text-lg md:text-xl lg:text-2xl">{title}</h2>
        <p class="text-sm text-left font-normal md:text-lg lg:text-xl h-fit">
            {#if description}
                {description}
            {/if}
            <slot name="description" />
        </p>
    </div>
</a>
