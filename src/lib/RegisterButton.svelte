<script lang="ts">
  import { page } from '$app/stores';
  export let classes = '';
</script>

<a href="/profile/register?page={$page.url.pathname}" class={classes}>Register</a>
