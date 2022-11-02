<script>
    import MenuButton from '$lib/MenuButton.svelte';
</script>

<svelte:head>
    <title>MyFit | Records</title>
</svelte:head>

<div class="breadcrumbs-container">
    <ul>
        <li><a href="/">Home</a></li>
        <li>Records</li>
    </ul>
</div>
<div class="menu-button-grid">
    <MenuButton
        title="Split records"
        description="Check and modify created splits"
        link="/records/splits"
    >
        <img src="$lib/assets/calendar.svg" alt="" class="responsive-image-menu-button" />
    </MenuButton>
    <MenuButton
        title="Workout records"
        description="Check and modify performed workouts"
        link="/records/workouts"
    >
        <img src="$lib/assets/dumbbell.svg" alt="" class="responsive-image-menu-button" />
    </MenuButton>
    <MenuButton
        title="Cardio records"
        description="Check and modify performed cardio workouts"
        link="/records/cardio"
    >
        <img src="$lib/assets/heart.svg" alt="" class="responsive-image-menu-button" />
    </MenuButton>
    <MenuButton title="Sleep records" description="Check and edit sleep logs" link="/records/sleep">
        <img src="$lib/assets/moon.svg" alt="" class="responsive-image-menu-button" />
    </MenuButton>
    <MenuButton
        title="Nutritional records"
        description="Check and edit nutrition logs"
        link="/records/nutrition"
    >
        <img src="$lib/assets/bowl.svg" alt="" class="responsive-image-menu-button" />
    </MenuButton>
    <MenuButton
        title="Body metrics records"
        description="Check and edit body metrics"
        link="/records/bodystats"
    >
        <img src="$lib/assets/scale.svg" alt="" class="responsive-image-menu-button" />
    </MenuButton>
</div>
