<script lang="ts">
	import {
		FieldGroup,
		Field,
		FieldLabel,
		FieldDescription
	} from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { createMutation } from '@tanstack/svelte-query';
	import { authClient } from '$lib/auth-client';
	import { toast } from 'svelte-sonner';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import * as InputOTP from '$lib/components/ui/input-otp/index.js';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import * as m from '$lib/paraglide/messages';
	import { resolve } from '$app/paths';

	let email = $state('');
	let otp = $state('');
	let otpMailSent = $state(false);

	const authData = authClient.useSession();

	$effect(() => {
		if ($authData.isPending) return;
		if ($authData.data?.user) {
			toast.warning(m['login.alreadyLoggedIn']());
			const callbackUrl = page.url.searchParams.get('callbackUrl') || '/dashboard';
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			goto(callbackUrl);
		}
	});

	const sendOTPMutation = createMutation(() => ({
		mutationKey: ['send-otp'],
		mutationFn: async (email: string) => {
			const { error } = await authClient.emailOtp.sendVerificationOtp({ email, type: 'sign-in' });
			if (error) throw error;

			otpMailSent = true;
			toast.success(m['login.otpSentSuccess']());
			return email;
		},
		onError: (error) => {
			toast.error(m['login.otpSendError']());
			console.error(error);
		}
	}));

	const verifyOTPMutation = createMutation(() => ({
		mutationKey: ['verify-otp'],
		mutationFn: async (otp: string) => {
			const { data, error } = await authClient.signIn.emailOtp({ email, otp });
			if (error) throw error;

			if (data.user.name.trim() === '') {
				toast.success(m['login.registerSuccess']());
				goto(resolve('/onboarding/setup-account'));
				return data;
			}

			toast.success(m['login.loginSuccess']());
			const callbackUrl = page.url.searchParams.get('callbackUrl') || '/dashboard';
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			goto(callbackUrl);
			return data;
		},
		onError: (error) => {
			toast.error(m['login.otpVerifyError']());
			console.error(error);
		}
	}));
</script>

{#if !otpMailSent}
	<form class="flex flex-col" onsubmit={() => sendOTPMutation.mutate(email)}>
		<FieldGroup>
			<div class="flex flex-col items-center gap-1 text-center">
				<h1 class="text-2xl font-bold">{m['login.otpTitle']()}</h1>
				<p class="text-sm text-balance text-muted-foreground">
					{m['login.otpDescription']()}
				</p>
			</div>
			<Field>
				<FieldLabel for="email">{m['login.emailLabel']()}</FieldLabel>
				<Input
					id="email"
					name="email"
					type="email"
					placeholder={m['login.emailPlaceholder']()}
					required
					bind:value={email}
				/>
			</Field>
			<Field>
				<Button type="submit" disabled={sendOTPMutation.isPending}>
					{#if sendOTPMutation.isPending}
						<Spinner />
					{:else}
						{m['login.continueButton']()}
					{/if}
				</Button>
			</Field>
		</FieldGroup>
	</form>
{:else}
	<form class="flex flex-col" onsubmit={() => verifyOTPMutation.mutate(otp)}>
		<FieldGroup>
			<div class="flex flex-col items-center gap-1 text-center">
				<h1 class="text-2xl font-bold">{m['login.otpVerifyTitle']()}</h1>
				<p class="text-sm text-balance text-muted-foreground">
					{m['login.otpVerifyDescription']({ email })}
				</p>
			</div>
			<Field>
				<FieldLabel for="otp" class="sr-only">{m['login.otpCodeLabel']()}</FieldLabel>
				<InputOTP.Root maxlength={6} id="otp" required class="justify-center" bind:value={otp}>
					{#snippet children({ cells })}
						<InputOTP.Group
							class="gap-2 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border"
						>
							{#each cells.slice(0, 2) as cell (cell)}
								<InputOTP.Slot {cell} />
							{/each}
						</InputOTP.Group>
						<InputOTP.Separator />
						<InputOTP.Group
							class="gap-2 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border"
						>
							{#each cells.slice(2, 4) as cell (cell)}
								<InputOTP.Slot {cell} />
							{/each}
						</InputOTP.Group>
						<InputOTP.Separator />
						<InputOTP.Group
							class="gap-2 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border"
						>
							{#each cells.slice(4, 6) as cell (cell)}
								<InputOTP.Slot {cell} />
							{/each}
						</InputOTP.Group>
					{/snippet}
				</InputOTP.Root>
				<FieldDescription class="text-center">
					{m['login.otpCodeDescription']()}
				</FieldDescription>
			</Field>
			<Button type="submit" disabled={verifyOTPMutation.isPending}>
				{#if verifyOTPMutation.isPending}
					<Spinner />
				{:else}
					{m['login.verifyButton']()}
				{/if}
			</Button>
			<FieldDescription class="text-center font-normal">
				{m['login.otpResendPrompt']()}
				<Button variant="link" size="sm" class="p-0 underline">
					{m['login.otpResendButton']()}
				</Button>

				<br />
				{m['login.otpChangePrompt']()}
				<Button
					variant="link"
					size="sm"
					class="p-0 underline"
					onclick={() => (otpMailSent = false)}
				>
					{m['login.otpChangeButton']()}
				</Button>
			</FieldDescription>
		</FieldGroup>
	</form>
{/if}
