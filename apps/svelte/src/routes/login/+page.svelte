<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { authClient } from '$lib/auth/auth-client';
	import { Button } from '$lib/components/ui/button';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import { UserIcon } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	const isLoggedInQuery = createQuery(() => ({
		queryKey: ['session'],
		queryFn: async () => {
			const session = await authClient.getSession();
			if (session.data?.user) {
				toast.info("You're already signed in");
				goto(page.url.searchParams.get('redirect') ?? '/dashboard');
				return true;
			}
			return false;
		}
	}));

	const loginMutation = createMutation(() => ({
		mutationFn: async (loginType: 'google' | 'anonymous') => {
			if (!navigator.onLine)
				return toast.error('You are offline. Please check your internet connection');

			if (loginType === 'anonymous') {
				await authClient.signIn.anonymous();
				goto('/getting-started');
				return;
			}

			await authClient.signIn.social({
				provider: 'google',
				callbackURL: page.url.searchParams.get('redirect') ?? '/dashboard',
				newUserCallbackURL: '/getting-started'
			});
		},
		onError: (error) => {
			toast.error('An error occurred while signing in');
			console.error('Error signing in:', error);
		}
	}));
</script>

<div class="grid h-screen w-full grid-cols-1 md:grid-cols-2">
	<!-- Image Section -->
	<div class="bg-muted hidden md:block">
		<img
			src="https://images.unsplash.com/photo-1535743686920-55e4145369b9?q=80&w=1000"
			alt="Fitness"
			class="h-full w-full object-cover"
		/>
	</div>

	<!-- Form Section -->
	<div class="flex items-center justify-center px-4 sm:px-6 lg:px-8">
		<div class="w-full max-w-md space-y-8">
			<div class="text-center">
				<h1 class="text-2xl font-bold tracking-tight">Welcome to MyFit</h1>
				<p class="text-muted-foreground mt-2 text-sm">Sign in to access your fitness journey</p>
			</div>

			<div class="my-8 space-y-2">
				{#if isLoggedInQuery.isPending}
					<Skeleton class="h-10 w-full" />
					<Skeleton class="h-10 w-full" />
				{:else}
					<Button
						variant="secondary"
						disabled={isLoggedInQuery.data || loginMutation.isPending}
						class="flex w-full items-center justify-center gap-2"
						onclick={() => loginMutation.mutate('google')}
					>
						<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
							<path
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								fill="#4285F4"
							/>
							<path
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								fill="#34A853"
							/>
							<path
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								fill="#FBBC05"
							/>
							<path
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								fill="#EA4335"
							/>
						</svg>
						Sign in with Google
					</Button>
					<Button
						variant="secondary"
						disabled={isLoggedInQuery.data || loginMutation.isPending}
						class="flex w-full items-center justify-center gap-2"
						onclick={() => loginMutation.mutate('anonymous')}
					>
						<UserIcon />
						Sign in as anonymous
					</Button>
				{/if}
			</div>
			<p class="text-muted-foreground text-center text-sm">
				By continuing, you agree to our Terms of Service and <a
					href="/privacy-policy"
					class="underline"
				>
					Privacy Policy
				</a>
			</p>
		</div>
	</div>
</div>
