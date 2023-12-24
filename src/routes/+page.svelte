<script lang="ts">
  export let data;
</script>

<h2>Home</h2>
{#if !data.session}
  Log in to use the app
  <a class="btn btn-accent mt-1" href="/login">Login to the app</a>
{/if}
