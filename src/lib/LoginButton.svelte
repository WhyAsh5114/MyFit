<script lang="ts">
    import { page } from "$app/stores";
    export let classes = '';
</script>

<a href="/profile/login?page={$page.url.pathname}" class={classes}>Login</a>