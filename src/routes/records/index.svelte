<script>
    import MenuButtonGrid from "$lib/MenuButtonGrid.svelte";
    import ListButton from "$lib/ListButton.svelte";
</script>
<svelte:head>
    <title>MyFit | Records</title>
</svelte:head>

<MenuButtonGrid>
    <ListButton
        imagePath="/calendar.svg"
        title="Splits records"
        description="Check and modify created splits"
        link="/records/splits"
    />
    <ListButton
        imagePath="/dumbbell.png"
        title="Workout records"
        description="Check and modify performed workouts"
        link="/records/workouts"
    />
    <ListButton
        imagePath="/heart.svg"
        title="Cardio records"
        description="Check and modify performed cardio workouts"
        link="/records/cardio"
    />
    <ListButton
        imagePath="/moon.svg"
        title="Sleep records"
        description="Check and edit sleep logs"
        link="/records/sleep"
    />
    <ListButton
        imagePath="/bowl.svg"
        title="Nutritional records"
        description="Check and edit nutrition logs"
        link="/records/nutrition"
    />
    <ListButton
        imagePath="/scale.svg"
        title="Nutritional records"
        description="Check and edit body metrics"
        link="/records/bodystats"
    />
</MenuButtonGrid>
