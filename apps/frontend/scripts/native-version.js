import { readFileSync } from 'node:fs';

/**
 * Prints the iOS version settings for the version in `package.json`, as `xcodebuild` arguments.
 * The build number uses the same formula as the Android `versionCode`, so it rises with every
 * release and both platforms report the same release. The App Store only accepts numeric versions,
 * so a pre-release suffix such as `-beta.1` is dropped.
 */
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));
const [major, minor, patch] = version.split('.', 3).map((part) => parseInt(part, 10));

console.log(
	`MARKETING_VERSION=${major}.${minor}.${patch} CURRENT_PROJECT_VERSION=${major * 1_000_000 + minor * 1_000 + patch}`
);
