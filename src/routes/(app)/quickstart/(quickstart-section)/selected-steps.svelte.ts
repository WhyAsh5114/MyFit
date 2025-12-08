import { goto } from '$app/navigation';

function createSelectedStepsState() {
	let selectedSteps = $state<string[]>([]);

	if (typeof window !== 'undefined' && window.localStorage) {
		const selectedStepsItem = window.localStorage.getItem('selectedSteps');
		if (selectedStepsItem) {
			selectedSteps = JSON.parse(selectedStepsItem);
		}
	}

	function navigateToPage(pathname: string, direction: 'next' | 'previous') {
		const currentIndex = selectedStepsState.selectedSteps.findIndex((route) => route === pathname);
		const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
		if (targetIndex < 0) {
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			return goto(selectedStepsState.selectedSteps[0].split('/').slice(0, -1).join('/'));
		}
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		return goto(selectedStepsState.selectedSteps[targetIndex]);
	}

	return {
		get selectedSteps() {
			return selectedSteps;
		},
		set selectedSteps(value) {
			selectedSteps = value;
			window.localStorage.setItem('selectedSteps', JSON.stringify(value));
		},
		navigateToPage
	};
}

export const selectedStepsState = createSelectedStepsState();
