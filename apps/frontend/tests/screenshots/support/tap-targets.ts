import type { Page } from '@playwright/test';

/**
 * Lists the interactive elements on screen whose 44 × 44px box around the centre does not reach
 * them, which means a thumb aimed at the middle can land on something else. Disabled controls are
 * skipped because they cannot be tapped. When a dialog, sheet or drawer is open only it is checked,
 * since everything behind it is covered.
 */
export async function findSmallTargets(page: Page): Promise<string[]> {
	return page.evaluate(() => {
		const selector =
			'a[href],button,input,select,textarea,[role=button],[role=radio],[role=switch],[role=checkbox],[role=tab],[role=menuitem]';
		const overlay = document.querySelector('[role=dialog],[data-slot=drawer-content]');
		const root = overlay ?? document;
		const found: string[] = [];

		for (const element of root.querySelectorAll<HTMLElement>(selector)) {
			const rect = element.getBoundingClientRect();
			const field = element as HTMLInputElement;
			if (rect.width === 0 || rect.height === 0) continue;
			if (rect.bottom < 0 || rect.top > innerHeight || rect.right < 0 || rect.left > innerWidth)
				continue;
			if (getComputedStyle(element).visibility === 'hidden') continue;
			if (element.closest('[aria-hidden=true],[inert]')) continue;
			if (field.disabled || element.getAttribute('aria-disabled') === 'true') continue;

			const x = rect.left + rect.width / 2;
			const y = rect.top + rect.height / 2;
			// Clipped by a scroller or covered at the centre means it cannot be tapped anyway.
			const centre = document.elementFromPoint(x, y);
			if (!centre || !(element === centre || element.contains(centre))) continue;

			const probes: [number, number][] = [];
			if (rect.width < 44) probes.push([x - 21, y], [x + 21, y]);
			if (rect.height < 44) probes.push([x, y - 21], [x, y + 21]);

			let blocker = '';
			const missed = probes.some(([px, py]) => {
				if (px < 0 || py < 0 || px >= innerWidth || py >= innerHeight) return false;
				const hit = document.elementFromPoint(px, py);
				const labelled = field.labels && [...field.labels].some((label) => label.contains(hit));
				const reached = hit && (element === hit || element.contains(hit) || labelled);
				if (!reached && hit)
					blocker = `${hit.tagName.toLowerCase()}${hit.getAttribute('data-slot') ? `[${hit.getAttribute('data-slot')}]` : ''}`;
				return !reached;
			});
			if (!missed) continue;

			const name = (
				element.getAttribute('aria-label') ||
				element.textContent ||
				element.getAttribute('name') ||
				''
			)
				.trim()
				.slice(0, 30);
			found.push(
				`${element.tagName.toLowerCase()} "${name}" ${Math.round(rect.width)}×${Math.round(rect.height)} (under ${blocker || 'nothing'})`
			);
		}
		return found;
	});
}
