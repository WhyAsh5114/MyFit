<script lang="ts">
	import LoginForm from './components/login-form.svelte';
	import { resolve } from '$app/paths';
	import favicon from '$lib/assets/favicon.webp';
	// An Unsplash photo (free to use, no attribution needed), bundled so it works offline.
	import loginFood from '$lib/assets/login-food.webp';
	import { m } from '$lib/paraglide/messages';
</script>

<div class="grid min-h-svh lg:grid-cols-2">
	<div class="relative hidden bg-muted lg:block">
		<img
			src={loginFood}
			alt="Healthy food and nutrition"
			class="absolute inset-0 h-full w-full object-cover brightness-50"
		/>
	</div>
	<div class="flex flex-col gap-4 p-6 md:p-10">
		<div class="flex justify-center gap-2 md:justify-start">
			<a href={resolve('/')} class="flex items-center gap-2 font-medium">
				<div class="flex size-8 items-center justify-center rounded-md bg-secondary">
					<img src={favicon} alt={m['app.iconAlt']()} />
				</div>
				{m['app.name']()}
			</a>
		</div>
		<div class="flex flex-1 items-center justify-center">
			<div class="w-full max-w-md">
				<LoginForm />
			</div>
		</div>
	</div>
</div>
