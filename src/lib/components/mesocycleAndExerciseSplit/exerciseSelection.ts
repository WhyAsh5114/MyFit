/**
 * Builds the draft exercise when the user picks an exercise from the suggestion list.
 *
 * Suggestions can be partial (exercises from workout history only carry a name and muscle group),
 * so they are laid over the drawer's defaults. Replacing the draft outright would drop required
 * fields such as `setType`, and saving the split would then fail validation.
 */
export function buildDraftFromSelection<D extends object, S extends object, E extends object>(
	defaults: D,
	selected: S,
	extraProps?: E
) {
	return structuredClone({ ...defaults, ...selected, ...extraProps });
}
