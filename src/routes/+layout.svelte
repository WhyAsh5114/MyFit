<script lang="ts">
	import '../app.postcss';
	import { pwaInfo } from 'virtual:pwa-info';
	import PWAButton from './PWAButton.svelte';

	$: webManifest = pwaInfo ? pwaInfo.webManifest.linkTag : '';
</script>

<svelte:head>
	{@html webManifest}
    <title>MyFit</title>
</svelte:head>

<div class="navbar bg-primary">
	<div class="flex-1">
        <img src="/favicon.png" alt="" width="40" height="40" />
		<a class="btn btn-ghost normal-case text-xl text-white" href="/">MyFit</a>
	</div>
	<div class="flex-none">
		<div class="dropdown dropdown-end">
			<button class="btn btn-ghost btn-circle avatar">
				<div class="w-10 rounded-full">
					<img src="/profile.webp" alt="profile" />
				</div>
			</button>
			<ul class="menu dropdown-content mt-3 p-2 shadow bg-secondary text-black font-semibold rounded-box">
                <PWAButton />
				<li>
					<a> Profile </a>
				</li>
				<li><a>Settings</a></li>
				<li><a>Logout</a></li>
			</ul>
		</div>
	</div>
</div>
<slot />
