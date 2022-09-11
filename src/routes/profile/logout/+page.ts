import { invalidateAll } from "$app/navigation";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
    await fetch('/api/auth/logout', {
        method: 'GET'
    });
}
