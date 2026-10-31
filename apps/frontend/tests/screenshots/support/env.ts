import { join } from 'node:path';

/** Ports differ from the e2e and dev setups, so the screenshot run can sit beside both. */
export const WEB = 'http://localhost:4273';
export const API = 'http://localhost:3001';
export const MAIL = 'http://localhost:4010';

/** Where the images, manifest and gallery land. Ignored by git. */
export const OUT_DIR = join(import.meta.dirname, '../../../screenshots');

/** `jpeg` keeps the folder small; `png` is lossless when checking fine detail. */
export const FORMAT = process.env.SCREENSHOT_FORMAT === 'png' ? 'png' : 'jpeg';
export const EXT = FORMAT === 'png' ? 'png' : 'jpg';
