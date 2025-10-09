<script lang="ts">
	import ResponsiveDialog from '$lib/components/ResponsiveDialog.svelte';
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	const TERMS_ACCEPTED_KEY = 'myfit_terms_accepted';
	let open = $state(false);

	onMount(() => {
		if (browser) {
			const termsAccepted = localStorage.getItem(TERMS_ACCEPTED_KEY);
			if (!termsAccepted) {
				// Small delay to ensure everything is loaded
				setTimeout(() => {
					open = true;
				}, 500);
			}
		}
	});

	function acceptTerms() {
		if (browser) {
			localStorage.setItem(TERMS_ACCEPTED_KEY, 'true');
			open = false;
		}
	}

	function declineTerms() {
		// User declined - they can't use the app
		if (browser) {
			alert('You must accept the Terms of Service to use MyFit.');
			// Keep the dialog open
		}
	}
</script>

<ResponsiveDialog title="Terms of Service" bind:open dismissible={false}>
	{#snippet description()}
		<span class="text-sm">Please read and accept our Terms of Service to continue using MyFit.</span>
	{/snippet}

	<div class="mt-4 max-h-[50vh] space-y-4 overflow-y-auto rounded-lg border bg-muted/30 p-4 text-sm">
		<div>
			<h3 class="mb-2 font-semibold text-foreground">Medical Disclaimer</h3>
			<p class="text-muted-foreground">
				The information provided by MyFit is for general informational purposes only and is not intended to be a
				substitute for professional medical advice, diagnosis, or treatment.
			</p>
		</div>

		<div>
			<h3 class="mb-2 font-semibold text-foreground">Consult Your Physician</h3>
			<p class="text-muted-foreground">
				<strong
					>Before beginning any exercise program, you should consult with your physician or other qualified healthcare
					provider.</strong
				> This is especially important if you have any pre-existing health conditions, injuries, or concerns.
			</p>
		</div>

		<div>
			<h3 class="mb-2 font-semibold text-foreground">Assumption of Risk</h3>
			<p class="text-muted-foreground">
				You acknowledge that physical exercise involves inherent risks of injury. By using MyFit's progression
				algorithms and workout recommendations, you voluntarily assume all risks associated with such exercise,
				including but not limited to muscle strains, joint injuries, cardiovascular events, and other physical injuries.
			</p>
		</div>

		<div>
			<h3 class="mb-2 font-semibold text-foreground">User Responsibility</h3>
			<p class="text-muted-foreground">
				You are solely responsible for using proper exercise form and technique, adjusting recommendations based on your
				individual capabilities, listening to your body, stopping if you experience pain or discomfort, and seeking
				professional medical attention when needed.
			</p>
		</div>

		<div>
			<h3 class="mb-2 font-semibold text-foreground">Progression Algorithm Disclaimer</h3>
			<p class="text-muted-foreground">
				Our progression algorithms are based on general fitness principles and mathematical models. They are NOT
				personalized to your specific physiology, medical history, or current fitness level. You must use your own
				judgment and modify recommendations as appropriate for your individual circumstances.
			</p>
		</div>

		<div class="rounded-lg border-2 border-destructive bg-destructive/10 p-3">
			<p class="font-semibold text-destructive-foreground">
				⚠️ STOP EXERCISING IMMEDIATELY and seek emergency medical attention if you experience chest pain, difficulty
				breathing, dizziness, severe pain, or any other concerning symptoms.
			</p>
		</div>

		<div class="rounded-lg border bg-primary/10 p-3">
			<p class="text-xs text-muted-foreground">
				For complete Terms of Service, please visit:
				<a href="/terms-of-service" class="font-semibold text-primary hover:underline" target="_blank">
					myfit.fit/terms-of-service
				</a>
			</p>
		</div>
	</div>

	<div class="mt-6 flex flex-col gap-2">
		<Button onclick={acceptTerms} class="w-full">I Accept the Terms of Service</Button>
		<Button onclick={declineTerms} variant="outline" class="w-full">I Do Not Accept</Button>
	</div>
</ResponsiveDialog>
