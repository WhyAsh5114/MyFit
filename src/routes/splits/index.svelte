<script lang="ts">
    import ListButton from '$lib/ListButton.svelte';
    import MenuButtonGrid from '$lib/MenuButtonGrid.svelte';
</script>

<svelte:head>
    <title>MyFit | Splits</title>
</svelte:head>
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
