import { test, expect } from '@playwright/experimental-ct-svelte';
import MyModal from '$lib/MyModal.svelte';

test("Red color when title is 'Error'", async ({ mount }) => {
    const component = await mount(MyModal, {
        props: {
            modalTitle: 'Error'
        }
    });
    await expect(component.locator('[data-test-id=modal-title]')).toHaveClass(/text-red-500/);
});

test("Green color when title is 'Success'", async ({ mount }) => {
    const component = await mount(MyModal, {
        props: {
            modalTitle: 'Success'
        }
    });
    await expect(component.locator('[data-test-id=modal-title]')).toHaveClass(/text-green-500/);
});

test("Yellow color when title is 'Warning'", async ({ mount }) => {
    const component = await mount(MyModal, {
        props: {
            modalTitle: 'Warning'
        }
    });
    await expect(component.locator('[data-test-id=modal-title]')).toHaveClass(/text-yellow-500/);
});

test("Accent color when title is 'Help'", async ({ mount }) => {
    const component = await mount(MyModal, {
        props: {
            modalTitle: 'Help'
        }
    });
    await expect(component.locator('[data-test-id=modal-title]')).toHaveClass(/text-accent/);
});
