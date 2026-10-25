/** Gates account views while the session and local database ownership are reconciled. */
export const accountSession = $state({
	ownerId: null as string | null,
	ready: false,
	signingOut: false,
	logoutBusy: false,
	logoutError: null as string | null
});
