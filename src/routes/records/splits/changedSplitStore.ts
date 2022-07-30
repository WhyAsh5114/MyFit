import { writable, type Writable } from "svelte/store";

export const SelectedSplit: Writable<Split> = writable();
