<script lang="ts">
    import { page } from '$app/stores';
    import MenuButton from '$lib/MenuButton.svelte';

    let todaysWorkout: string | undefined;
    $: if ($page.data.user?.activeSplit) {
        const activeSplit = $page.data.user?.splits[$page.data.user?.activeSplit];
        todaysWorkout = activeSplit.schedule.at(new Date().getDay() - 1);
    }
</script>

<svelte:head>
    <title>MyFit | Log workouts</title>
</svelte:head>
<div class="breadcrumbs-container">
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/logging">Logging</a></li>
        <li>Workouts</li>
    </ul>
</div>
<div class="menu-button-grid">
    <MenuButton
        title="New workout"
        description="Log a new workout from scratch"
        link="/logging/workouts/new"
    >
        <img src="$lib/assets/calendar_plus.svg" alt="" class="responsive-image-menu-button" />
    </MenuButton>
    <MenuButton
        title="Use split template"
        link="/logging/workouts/overload?split=true"
        disabled={!todaysWorkout}
    >
        <img src="$lib/assets/calendar.svg" alt="" class="responsive-image-menu-button" />
        <p slot="description">
            {#if todaysWorkout === 'Rest'}
                Today is a <b class="text-accent">Rest</b> day according to your
                <b class="text-accent">{$page.data.user?.activeSplit}</b> split
            {:else if !$page.data.user?.activeSplit}
                <p class="text-error font-semibold">No active split</p>
            {:else}
                Template from latest split workout performed. Today is <b
                    class="text-accent"
                    data-test-id="todays-workout">{todaysWorkout}</b
                >
            {/if}
        </p>
    </MenuButton>
    <MenuButton
        title="Use workout template"
        description="Template from already performed workout"
        link="/logging/workouts/select_workout"
    >
        <img src="$lib/assets/calendar_dumbbell.svg" alt="" class="responsive-image-menu-button" />
    </MenuButton>
</div>
