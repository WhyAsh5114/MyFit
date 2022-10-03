<script>
    import { page } from '$app/stores';
    const split = $page.error.message;
</script>

<div class="flex flex-col flex-grow justify-center center">
    <h1 class="text-red-500 text-4xl font-bold">Error</h1>
    <h3 class="text-2xl font-semibold">404</h3>
    <p>Split <b>{split}</b> not found</p>

    <div class="h-px w-full bg-gray-200 my-4" />

    <a class="btn btn-primary btn-md" href="/records/splits">Split records</a>
</div>
