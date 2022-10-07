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
        title="New split"
        description="Create a weekly routine from scratch"
        link="/splits/new"
    >
        <img src="$lib/assets/calendar_plus.svg" alt="" class="responsive-image-menu-button" />
    </MenuButton>
    <MenuButton title="Common splits" description="Adjust and use common splits" link="/">
        <img src="$lib/assets/calendar_PPL.svg" alt="" class="responsive-image-menu-button" />
    </MenuButton>
    <MenuButton
        title="Modify split"
        description="Modify current split's exercises, progression"
        link="/"
    >
        <img src="$lib/assets/calendar_gear.svg" alt="" class="responsive-image-menu-button" />
    </MenuButton>
    <MenuButton
        title="Split records"
        description="View, copy and adjust previous splits"
        link="/records/splits"
    >
        <img src="$lib/assets/record.svg" alt="" class="responsive-image-menu-button" />
    </MenuButton>
</div>
