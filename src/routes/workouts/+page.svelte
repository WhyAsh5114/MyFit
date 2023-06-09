<script lang="ts">
    export let data;
</script>

<div class="flex flex-col bg-primary p-5 rounded-lg w-full">
	<h3 class="card-title">Current Mesocycle</h3>
	<div class="h-0.5 bg-black mt-1 mb-4" />
	<select class="select select-sm select-bordered w-full">
		{#if data.mesocycles === null || data.mesocycles.length === 0}
            <option>No mesocycle created</option>
        {:else}
            {#if !data.selectedMesoIndex}
                <option selected>No active mesocycle</option>
            {/if}
            {#each data.mesocycles as meso, i}
                {#if meso}
                    {#if data.selectedMesoIndex === i}
                        <option selected>{meso.name}</option>
                    {:else}
                        <option>{meso.name}</option>
                    {/if}
                {/if}
            {/each}
        {/if}
	</select>
</div>
