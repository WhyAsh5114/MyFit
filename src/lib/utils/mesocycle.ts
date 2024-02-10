export function getTotalDuration(RIRProgression: Mesocycle["RIRProgression"]) {
  return RIRProgression.reduce((totalDuration, progression) => {
    return totalDuration + progression.cycles;
  }, 0);
}

export function getPrimarySpecializations(specializations: Mesocycle["specializations"]) {
  if (!specializations) return [];
  return specializations
    .filter((specialization) => specialization.type === "primary")
    .map((specialization) => specialization.muscleGroup);
}

export function getSecondarySpecializations(specializations: Mesocycle["specializations"]) {
  if (!specializations) return [];
  return specializations
    .filter((specialization) => specialization.type === "secondary")
    .map((specialization) => specialization.muscleGroup);
}
