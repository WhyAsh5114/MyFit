import { expect, test } from '@playwright/test';
import { formatDuration } from '../../src/lib/utils/duration';

test('formats elapsed workout durations across minute and hour boundaries', () => {
	for (const [seconds, expected] of [
		[0, '0:00'],
		[59.9, '0:59'],
		[60, '1:00'],
		[3599, '59:59'],
		[3600, '1:00:00'],
		[3661, '1:01:01'],
		[360000, '100:00:00']
	] as const) {
		expect(formatDuration(seconds)).toBe(expected);
	}
});

test('clamps future start times and invalid elapsed values to zero', () => {
	for (const seconds of [-60, NaN, Infinity]) {
		expect(formatDuration(seconds)).toBe('0:00');
	}
});
