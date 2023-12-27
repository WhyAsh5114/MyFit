<script lang="ts">
  export let data;
</script>

<h2>Exercise splits</h2>

<div class="h-px flex flex-col grow overflow-y-auto gap-1">
  {#each data.exerciseSplits as exerciseSplit}
    <a class="flex p-2 bg-primary rounded-md" href="/exerciseSplits/view/{exerciseSplit._id}">
      <span class="font-semibold">{exerciseSplit.name}</span>
    </a>
  {/each}
</div>
<a class="btn btn-accent" href="/exerciseSplits/templates">Create new split</a>
