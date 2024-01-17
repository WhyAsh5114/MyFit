import type { WithUserId } from "$lib/types/arrays.js";

export const load = async ({ fetch }) => {
  const response = await fetch("/api/mesocycles?active");

  let activeMesocycles: WithSID<WithUserId<Mesocycle>>[] = [];
  if (response.ok) {
    activeMesocycles = await response.json();
  }

  return { activeMesocycles };
};
