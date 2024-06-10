export function createMesocycleRunes() {
	let mesocycleName = $state('');
	let editingMesocycleId: number | null = $state(null);

	return {
		get editingMesocycleId() {
			return editingMesocycleId;
		},
		set editingMesocycleId(id: number | null) {
			editingMesocycleId = id;
		}
	};
}

export const mesocycleRunes = createMesocycleRunes();
