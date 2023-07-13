export const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const commonSplits: Record<string, string[]> = {
	'Push Pull Legs': ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', ''],
	'Upper Lower': ['Upper', 'Lower', '', 'Upper', 'Lower', '', ''],
	'Full body': ['Full body', '', '', 'Full body', '', '', '']
};

export type VolumeLandmarks = Record<(typeof commonMuscleGroups)[number], VolumeLandmark>;
export type VolumeLandmark = {
	MV: number;
	MEV: number;
	freqStart: number;
	freqEnd: number;
	MRV: Record<number, number>;
	including?: string[];
};

export const volumeLandmarks: VolumeLandmarks = {
	Chest: { MV: 4, MEV: 6, freqStart: 2, freqEnd: 3, MRV: { 2: 20, 3: 25, 4: 30, 5: 35, 6: 35 } },
	'Front delts': {
		MV: 0,
		MEV: 0,
		freqStart: 2,
		freqEnd: 3,
		MRV: { 2: 12, 3: 16, 4: 16, 5: 16, 6: 16 },
		including: ['Compound pressing']
	},
	'Side delts': {
		MV: 6,
		MEV: 8,
		freqStart: 3,
		freqEnd: 6,
		MRV: { 2: 25, 3: 30, 4: 35, 5: 40, 6: 40 }
	},
	'Rear delts': {
		MV: 0,
		MEV: 6,
		freqStart: 3,
		freqEnd: 6,
		MRV: { 2: 18, 3: 25, 4: 30, 5: 35, 6: 35 },
		including: ['Pulling work for the back']
	},
	Back: { MV: 6, MEV: 10, freqStart: 2, freqEnd: 4, MRV: { 2: 20, 3: 25, 4: 30, 5: 35, 6: 35 } },
	Traps: {
		MV: 0,
		MEV: 0,
		freqStart: 2,
		freqEnd: 3,
		MRV: { 2: 20, 3: 25, 4: 30, 5: 35, 6: 40 },
		including: ['Pulling work for the back', 'Deadlifts']
	},
	Triceps: {
		MV: 4,
		MEV: 6,
		freqStart: 2,
		freqEnd: 4,
		MRV: { 2: 16, 3: 20, 4: 25, 5: 30, 6: 30 },
		including: ['Compound pressing']
	},
	Biceps: {
		MV: 4,
		MEV: 8,
		freqStart: 3,
		freqEnd: 6,
		MRV: { 2: 20, 3: 25, 4: 30, 5: 35, 6: 35 },
		including: ['Pulling work for the back']
	},
	Forearms: {
		MV: 0,
		MEV: 2,
		freqStart: 3,
		freqEnd: 6,
		MRV: { 2: 15, 3: 20, 4: 25, 5: 25, 6: 25 },
		including: ['Pulling work for the back']
	},
	Quads: { MV: 6, MEV: 8, freqStart: 2, freqEnd: 3, MRV: { 2: 18, 3: 22, 4: 26, 5: 30, 6: 30 } },
	Hamstrings: {
		MV: 3,
		MEV: 4,
		freqStart: 2,
		freqEnd: 3,
		MRV: { 2: 12, 3: 16, 4: 18, 5: 18, 6: 18 }
	},
	Glutes: {
		MV: 0,
		MEV: 0,
		freqStart: 2,
		freqEnd: 5,
		MRV: { 2: 12, 3: 18, 4: 25, 5: 30, 6: 30 },
		including: ['Quads and Hamstrings work']
	},
	Calves: { MV: 6, MEV: 8, freqStart: 3, freqEnd: 6, MRV: { 2: 16, 3: 20, 4: 25, 5: 30, 6: 35 } }
};
