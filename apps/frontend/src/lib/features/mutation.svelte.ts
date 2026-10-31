type Options<Variables, Data> = {
	mutationFn: (variables: Variables) => Promise<Data>;
	/** Awaited before the mutation settles, so a returned reload finishes before the caller continues. */
	onSuccess?: (data: Data, variables: Variables) => unknown;
	onError?: (error: unknown, variables: Variables) => void;
};

/**
 * A write with the state a button needs: `isPending` while any call is in flight. `mutateAsync`
 * rejects after `onError` has reported the failure, so callers can stay on their form; `mutate`
 * leaves the failure to `onError`. A call is never retried.
 */
export function useMutation<Variables, Data>(options: Options<Variables, Data>) {
	let pending = $state(0);

	async function mutateAsync(variables: Variables): Promise<Data> {
		pending++;
		try {
			const data = await options.mutationFn(variables);
			await options.onSuccess?.(data, variables);
			return data;
		} catch (error) {
			options.onError?.(error, variables);
			throw error;
		} finally {
			pending--;
		}
	}

	return {
		get isPending() {
			return pending > 0;
		},
		mutateAsync,
		mutate: (variables: Variables) => void mutateAsync(variables).catch(() => {})
	};
}
