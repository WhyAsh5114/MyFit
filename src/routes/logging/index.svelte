<script>
    import MenuButtonGrid from '$lib/MenuButtonGrid.svelte';
    import ListButton from '$lib/ListButton.svelte';
</script>

<svelte:head>
    <title>MyFit | Logging</title>
</svelte:head>
<MenuButtonGrid>
    <ListButton
        imagePath="/dumbbell.png"
        title="Log workout"
        description="Reps, sets, load, duration, calories burned"
        link="/logging/workouts"
    />
    <ListButton
        imagePath="/heart.svg"
        title="Log cardio"
        description="Duration, calories burned, average heart rate"
        link="/logging/cardio"
    />
    <ListButton
        imagePath="/moon.svg"
        title="Sleep records"
        description="Duration, quality, tiredness, wake up time"
        link="/logging/sleep"
    />
    <ListButton
        imagePath="/bowl.svg"
        title="Nutritional records"
        description="Calorie intake, macronutrients, foods"
        link="/logging/nutrition"
    />
    <ListButton
        imagePath="/scale.svg"
        title="Nutritional records"
        description="Steps, weight, height, fat percentage"
        link="/logging/bodystats"
    />
</MenuButtonGrid>
