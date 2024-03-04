<script>
	import '../app.pcss';
	import { ModeWatcher } from 'mode-watcher';
</script>

<ModeWatcher />
<header class="border-b">Navbar</header>
<main class="flex h-px grow flex-col overflow-y-auto">
	<slot />
</main>
