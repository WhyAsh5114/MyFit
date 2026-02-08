<script lang="ts">
	import LoginForm from './components/login-form.svelte';
	import { resolve } from '$app/paths';
	import favicon from '$lib/assets/favicon.webp';
	import { m } from '$lib/paraglide/messages';
</script>

<div class="grid min-h-svh lg:grid-cols-2">
	<div class="relative hidden bg-muted lg:block">
		<img
			src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1000&h=1200&fit=crop"
			alt="Healthy food and nutrition"
			class="absolute inset-0 h-full w-full object-cover brightness-50 grayscale"
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
