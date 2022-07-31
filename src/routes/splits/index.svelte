<script lang="ts">
    import ListButton from '$lib/ListButton.svelte';
    import MenuButtonGrid from '$lib/MenuButtonGrid.svelte';
</script>

<svelte:head>
    <title>MyFit | Splits</title>
</svelte:head>
<div class="text-sm breadcrumbs flex flex-col place-items-center bg-secondary text-black px-2 rounded-lg font-semibold w-full mb-2">
    <ul>
        <li><a href="/">Home</a></li>
        <li>Splits</li>
    </ul>
</div>
<MenuButtonGrid>
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
</MenuButtonGrid>
