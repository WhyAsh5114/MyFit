<script>
    import MenuButton from '$lib/MenuButton.svelte';
</script>

<svelte:head>
    <title>MyFit | Logging</title>
</svelte:head>
<div class="breadcrumbs-container">
    <ul>
        <li><a href="/">Home</a></li>
        <li>Logging</li>
    </ul>
</div>
<div class="menu-button-grid">
    <MenuButton
        title="Log workout"
        description="Reps, sets, load, duration, calories burned"
        link="/logging/workouts"
    >
        <img src="$lib/assets/dumbbell.svg" alt="" class="responsive-image-menu-button" />
    </MenuButton>
    <MenuButton
        title="Log cardio"
        description="Duration, calories burned, average heart rate"
        link="/logging/cardio"
    >
        <img src="$lib/assets/heart.svg" alt="" class="responsive-image-menu-button" />
    </MenuButton>
    <MenuButton
        title="Log sleep"
        description="Duration, quality, tiredness, wake up time"
        link="/logging/sleep"
    >
        <img src="$lib/assets/moon.svg" alt="" class="responsive-image-menu-button" />
    </MenuButton>
    <MenuButton
        title="Log nutrition"
        description="Calorie intake, macronutrients, foods"
        link="/logging/nutrition"
    >
        <img src="$lib/assets/bowl.svg" alt="" class="responsive-image-menu-button" />
    </MenuButton>
    <MenuButton
        title="Log body metrics"
        description="Steps, weight, height, fat percentage"
        link="/logging/bodystats"
    >
        <img src="$lib/assets/scale.svg" alt="" class="responsive-image-menu-button" />
    </MenuButton>
</div>
