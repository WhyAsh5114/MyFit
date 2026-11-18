import { prefersReducedMotion } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';

/**
 * How layerchart animates a chart to new values: a short tween (DESIGN.md → Motion), or an
 * instant change when the user asks for reduced motion. Read it in markup so it follows the setting.
 */
export const chartMotion = {
	get current() {
		return prefersReducedMotion.current
			? ('none' as const)
			: { type: 'tween' as const, duration: 300, easing: cubicOut };
	}
};
