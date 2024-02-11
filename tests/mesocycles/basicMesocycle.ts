export const basicMesocycle: Omit<Omit<Mesocycle, "startTimestamp">, "exerciseSplitId"> & {
  exerciseSplitId?: string;
} = {
  name: "MesocycleName",
  RIRProgression: [
    {
      specificRIR: 0,
      cycles: 1
    },
    {
      specificRIR: 1,
      cycles: 3
    },
    {
      specificRIR: 2,
      cycles: 3
    },
    {
      specificRIR: 3,
      cycles: 3
    }
  ],
  caloricBalance: 0,
  endTimestamp: null,
  workouts: [],
  performanceLosses: {
    exercises: [],
    muscleGroups: [],
    microcycle: null
  },
  specializations: null
};
