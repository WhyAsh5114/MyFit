import { writable, type Writable } from "svelte/store";

export const ShowIndicator: Writable<boolean> = writable(false);
