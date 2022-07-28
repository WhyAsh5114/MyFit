import type { PlaywrightTestConfig } from '@playwright/experimental-ct-svelte';
import { resolve } from 'node:path';

const config: PlaywrightTestConfig = {
  testDir: 'src/tests-components',
  use: {
    ctViteConfig: {
      resolve: {
        alias: {
          // Setup the built-in $lib alias in SvelteKit
          $lib: resolve('src/lib')
        }
      }
    }
  }
};

export default config;