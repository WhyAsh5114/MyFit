<script>
    import MenuButton from '$lib/MenuButton.svelte';
</script>

<svelte:head>
    <title>MyFit | Logging</title>
</svelte:head>
<div class="menu-button-grid">
    <MenuButton
        imagePath="/dumbbell.png"
        title="Log workout"
        description="Reps, sets, load, duration, calories burned"
        link="/logging/workouts"
    />
    <MenuButton
        imagePath="/heart.svg"
        title="Log cardio"
        description="Duration, calories burned, average heart rate"
        link="/logging/cardio"
    />
    <MenuButton
        imagePath="/moon.svg"
        title="Sleep records"
        description="Duration, quality, tiredness, wake up time"
        link="/logging/sleep"
    />
    <MenuButton
        imagePath="/bowl.svg"
        title="Nutritional records"
        description="Calorie intake, macronutrients, foods"
        link="/logging/nutrition"
    />
    <MenuButton
        imagePath="/scale.svg"
        title="Nutritional records"
        description="Steps, weight, height, fat percentage"
        link="/logging/bodystats"
    />
</div>
