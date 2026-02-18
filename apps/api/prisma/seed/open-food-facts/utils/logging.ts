/**
 * Logging utilities for the seed script
 */

import chalk from 'chalk';

function log(message: string): void {
	const timestamp = new Date().toLocaleTimeString();
	console.log(`${chalk.bold.gray(`[${timestamp}`)}${chalk.gray(`]`)} ${message}`);
}

export function logSuccess(message: string): void {
	log(chalk.green(`✓ ${message}`));
}

export function logWarning(message: string): void {
	log(chalk.yellow(`⚠ ${message}`));
}

export function logInfo(message: string): void {
	log(chalk.cyan(`ℹ ${message}`));
}

export function logError(message: string): void {
	log(chalk.red(`✗ ${message}`));
}

function formatSeconds(seconds: number): string {
	if (seconds < 60) return `${Math.round(seconds)}s`;
	if (seconds < 3600) {
		const mins = Math.floor(seconds / 60);
		const secs = Math.round(seconds % 60);
		return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
	}
	const hours = Math.floor(seconds / 3600);
	const mins = Math.round((seconds % 3600) / 60);
	return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function logProgressWithETA(
	rows: number,
	bytesRead: number,
	totalBytes: number,
	speedMBps: string,
	remainingSeconds: number
): void {
	const percentage = ((bytesRead / totalBytes) * 100).toFixed(1);
	const formatted = `◇ Processed ${rows.toLocaleString()} rows | ${percentage}% | Speed: ${speedMBps} MB/s | ETA: ${formatSeconds(remainingSeconds)}`;
	process.stdout.write(`\r${chalk.blue(formatted)}${chalk.dim('                    ')}`);
}

export function logDownloadProgress(current: number, total: number, speed: string): void {
	const percentage = total > 0 ? ((current / total) * 100).toFixed(1) : '0.0';
	const remaining = Math.max(0, total - current);
	const speedMBps = parseFloat(speed);
	const remainingSeconds = speedMBps > 0 ? remaining / 1024 / 1024 / speedMBps : 0;
	const remainingTime = formatSeconds(remainingSeconds);
	const formatted = `⬇ Downloaded ${(current / 1024 / 1024).toFixed(2)} MB / ${(total / 1024 / 1024).toFixed(2)} MB (${percentage}%) | Speed: ${speed} | ETA: ${remainingTime}`;
	process.stdout.write(`\r${chalk.blue(formatted)}${chalk.dim('                    ')}`);
}

export function logBanner(title: string): void {
	console.log();
	console.log(chalk.cyan.bold('╔════════════════════════════════════════╗'));
	console.log(chalk.cyan.bold(`║   ${title.padEnd(36)}   ║`));
	console.log(chalk.cyan.bold('╚════════════════════════════════════════╝'));
	console.log();
}

export function logSuccessBanner(title: string): void {
	console.log();
	console.log(chalk.green.bold('╔════════════════════════════════════════╗'));
	console.log(chalk.green.bold(`║   ${title.padEnd(36)}   ║`));
	console.log(chalk.green.bold('╚════════════════════════════════════════╝'));
	console.log();
}
