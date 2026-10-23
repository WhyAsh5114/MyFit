/** Keeps database reset compatible while network sync is disabled. */
export const syncWorkerState = {
	/** No worker runs until the API supports the shared schema contract. */
	stop() {}
};
