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
        imagePath="/calendar.svg"
        title="Split records"
        description="Check and modify created splits"
        link="/records/splits"
    />
    <MenuButton
        imagePath="/dumbbell.png"
        title="Workout records"
        description="Check and modify performed workouts"
        link="/records/workouts"
    />
    <MenuButton
        imagePath="/heart.svg"
        title="Cardio records"
        description="Check and modify performed cardio workouts"
        link="/records/cardio"
    />
    <MenuButton
        imagePath="/moon.svg"
        title="Sleep records"
        description="Check and edit sleep logs"
        link="/records/sleep"
    />
    <MenuButton
        imagePath="/bowl.svg"
        title="Nutritional records"
        description="Check and edit nutrition logs"
        link="/records/nutrition"
    />
    <MenuButton
        imagePath="/scale.svg"
        title="Nutritional records"
        description="Check and edit body metrics"
        link="/records/bodystats"
    />
</div>
