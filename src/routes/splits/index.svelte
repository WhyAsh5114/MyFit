<script context="module">
    export const prerender = true;
</script>

<script lang="ts">
    import ListButton from '$lib/ListButton.svelte';
</script>

<svelte:head>
    <title>MyFit | Splits</title>
</svelte:head>
<div class="flex flex-col justify-center h-full">
    <div class="grid gap-3 lg:gap-5 lg:grid-cols-2 h-fit lg:h-1/2">
        <ListButton
            imagePath="/calendar_plus.svg"
            title="New split"
            description="Create a weekly routine from scratch"
            link="/splits/new"
        />
        <ListButton
            imagePath="/calendar_PPL.svg"
            title="Common splits"
            description="Adjust and use common splits"
            link="/"
        />
        <ListButton
            imagePath="/calendar_gear.svg"
            title="Modify split"
            description="Modify current split's exercises, progression"
            link="/"
        />
        <ListButton
            imagePath="/record.svg"
            title="Splits records"
            description="View, copy and adjust previous splits"
            link="/"
        />
    </div>
</div>
