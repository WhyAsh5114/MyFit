<script lang="ts">
    import MenuButton from '$lib/MenuButton.svelte';
</script>

<svelte:head>
    <title>MyFit | Splits</title>
</svelte:head>
<div class="breadcrumbs-container">
    <ul>
        <li><a href="/">Home</a></li>
        <li>Splits</li>
    </ul>
</div>
<div class="menu-button-grid">
    <MenuButton
        imagePath="/calendar_plus.svg"
        title="New split"
        description="Create a weekly routine from scratch"
        link="/splits/new"
    />
    <MenuButton
        imagePath="/calendar_PPL.svg"
        title="Common splits"
        description="Adjust and use common splits"
        link="/"
    />
    <MenuButton
        imagePath="/calendar_gear.svg"
        title="Modify split"
        description="Modify current split's exercises, progression"
        link="/"
    />
    <MenuButton
        imagePath="/record.svg"
        title="Splits records"
        description="View, copy and adjust previous splits"
        link="/"
    />
</div>
