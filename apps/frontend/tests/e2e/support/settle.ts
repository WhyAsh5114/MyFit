import type { Page } from '@playwright/test';

/**
 * Waits until the page stops moving: fonts are loaded, every animation and transition that ends
 * has ended, and a frame has painted after that. Use it before a screenshot, or before checking
 * that something did not happen, instead of a fixed sleep. Endless animations (spinners, shimmer)
 * and scroll-driven ones (`scroll-fade-x`) never end, so they are skipped; wait for a spinner to
 * go away with a web-first assertion first.
 */
export async function settle(page: Page) {
	await page.evaluate(async () => {
		const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
		await document.fonts.ready;
		// Two frames, so an animation started by the last action has begun.
		await frame();
		await frame();
		const ending = document
			.getAnimations()
			.filter(
				(animation) =>
					animation.timeline === document.timeline &&
					animation.effect?.getComputedTiming().iterations !== Infinity
			);
		await Promise.all(ending.map((animation) => animation.finished.catch(() => {})));
		await frame();
	});
}
