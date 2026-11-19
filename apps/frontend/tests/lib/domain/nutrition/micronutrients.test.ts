import { describe, expect, it } from 'vitest';
import {
	MICRONUTRIENTS,
	micronutrientReference,
	micronutrientStatus,
	micronutrientSummary
} from '#lib/domain/nutrition/micronutrients.js';

const man = (age: number) => ({ age, gender: 'Male' as const });
const woman = (age: number) => ({ age, gender: 'Female' as const });

describe('micronutrientReference', () => {
	it('scales fibre and saturated fat with the calorie target', () => {
		expect(micronutrientReference('fiberG_100g', man(30), 2000)).toBe(28);
		expect(micronutrientReference('saturatedFatG_100g', man(30), 1800)).toBe(20);
	});

	it('keeps sodium at one limit for everyone', () => {
		expect(micronutrientReference('sodiumMg_100g', woman(16), 1500)).toBe(2300);
		expect(micronutrientReference('sodiumMg_100g', man(80), 3000)).toBe(2300);
	});

	it('reads the age and sex band', () => {
		expect(micronutrientReference('ironMg_100g', woman(30), 2000)).toBe(18);
		expect(micronutrientReference('ironMg_100g', woman(51), 2000)).toBe(8);
		expect(micronutrientReference('ironMg_100g', man(30), 2000)).toBe(8);
		expect(micronutrientReference('vitaminCMg_100g', man(30), 2000)).toBe(90);
		expect(micronutrientReference('vitaminCMg_100g', woman(30), 2000)).toBe(75);
		expect(micronutrientReference('calciumMg_100g', woman(60), 2000)).toBe(1200);
		expect(micronutrientReference('calciumMg_100g', man(60), 2000)).toBe(1000);
	});

	it('puts each age at the right band boundary', () => {
		expect(micronutrientReference('magnesiumMg_100g', man(18), 2000)).toBe(410);
		expect(micronutrientReference('magnesiumMg_100g', man(19), 2000)).toBe(400);
		expect(micronutrientReference('magnesiumMg_100g', man(30), 2000)).toBe(400);
		expect(micronutrientReference('magnesiumMg_100g', man(31), 2000)).toBe(420);
		expect(micronutrientReference('calciumMg_100g', man(70), 2000)).toBe(1000);
		expect(micronutrientReference('calciumMg_100g', man(71), 2000)).toBe(1200);
		expect(micronutrientReference('vitaminDIU_100g', woman(70), 2000)).toBe(15);
		expect(micronutrientReference('vitaminDIU_100g', woman(71), 2000)).toBe(20);
	});

	it('gives users under 14 the 14–18 values', () => {
		expect(micronutrientReference('calciumMg_100g', man(12), 2000)).toBe(1300);
	});
});

describe('micronutrientStatus', () => {
	it('marks a floor once it is met, and never judges being under', () => {
		expect(micronutrientStatus('floor', 2.4, 2.4)).toEqual({ kind: 'on-target' });
		expect(micronutrientStatus('floor', 1, 2.4)).toEqual({ kind: 'neutral' });
	});

	it('flags a ceiling once it is passed', () => {
		expect(micronutrientStatus('ceiling', 2300, 2300)).toEqual({ kind: 'neutral' });
		expect(micronutrientStatus('ceiling', 2400, 2300)).toEqual({
			kind: 'off-target',
			direction: 'over',
			severity: 'slight'
		});
		expect(micronutrientStatus('ceiling', 2600, 2300)).toEqual({
			kind: 'off-target',
			direction: 'over',
			severity: 'far'
		});
	});

	it('stays neutral without a reference', () => {
		expect(micronutrientStatus('floor', 50, null)).toEqual({ kind: 'neutral' });
		expect(micronutrientStatus('ceiling', 5000, 0)).toEqual({ kind: 'neutral' });
	});
});

describe('micronutrientSummary', () => {
	const empty = Object.fromEntries(MICRONUTRIENTS.map(({ key }) => [key, null])) as Record<
		(typeof MICRONUTRIENTS)[number]['key'],
		number | null
	>;
	const yogurt = { ...empty, quantityG: 200, calciumMg_100g: 110, vitaminDIU_100g: 40 };
	const sandwich = { ...empty, quantityG: 220, calciumMg_100g: 50, fiberG_100g: 2 };

	it('adds each entry scaled by its quantity, counting a missing value as nothing', () => {
		const rows = micronutrientSummary([yogurt, sandwich], man(30), 2000);
		const row = (key: string) => rows.find((r) => r.key === key);
		expect(row('calciumMg_100g')?.amount).toBe(330);
		expect(row('fiberG_100g')?.amount).toBeCloseTo(4.4);
		expect(row('ironMg_100g')?.amount).toBe(0);
	});

	it('converts vitamin D from IU to µg', () => {
		const rows = micronutrientSummary([yogurt], man(30), 2000);
		expect(rows.find((r) => r.key === 'vitaminDIU_100g')?.amount).toBe(2);
	});

	it('keeps the display order and has no references without body metrics', () => {
		const rows = micronutrientSummary([], null, null);
		expect(rows.map((r) => r.key)).toEqual(MICRONUTRIENTS.map((n) => n.key));
		expect(rows.every((r) => r.reference === null && r.status.kind === 'neutral')).toBe(true);
	});
});
