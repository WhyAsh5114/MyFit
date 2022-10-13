<script lang="ts">
    import MenuButton from '$lib/MenuButton.svelte';
    import { page } from '$app/stores';
    import { CurrentSplitOriginalName } from '../records/splits/[split]/editSplitStore';
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
        title="Modify active split"
        description="Modify current split's exercises, progression"
        link={`/records/splits/${$page.data.user?.activeSplit}`}
        onClick={() => {
            if ($CurrentSplitOriginalName === $page.data.user?.activeSplit) {
                let activeSplit = $page.data.user?.activeSplit;
                if (activeSplit && $CurrentSplitOriginalName) {
                    if (
                        $page.data.user?.splits[activeSplit].timeCreated ===
                        $page.data.user?.splits[$CurrentSplitOriginalName].timeCreated
                    ) {
                        return;
                    }
                }
            }
            $CurrentSplitOriginalName = undefined;
        }}
        disabled={$page.data.user?.activeSplit === undefined}
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
