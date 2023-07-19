import { authTest } from '../../playwright/fixtures';

authTest('should load meso page if logged in', async ({ page }) => {
  await page.goto('/mesocycles')
});
