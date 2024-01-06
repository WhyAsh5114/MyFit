<script lang="ts">
  export let data;
</script>

<div class="flex flex-col gap-1 h-px grow">
  {#each data.mesocycles as mesocycle}
    {mesocycle}
  {/each}
</div>

<a class="btn btn-accent mt-2" href="/mesocycles/new">Create new mesocycle</a>
