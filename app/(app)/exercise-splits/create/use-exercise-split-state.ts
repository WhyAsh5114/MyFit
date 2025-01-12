import { ExerciseSplit, ExerciseSplitDay } from "@prisma/client";
import { create } from "zustand";

type ExerciseSplitState = {
  exerciseSplit: ExerciseSplit | null;
  setExerciseSplit: (exerciseSplit: ExerciseSplit) => void;
};

export const useExerciseSplitState = create<ExerciseSplitState>((set) => ({
  exerciseSplit: null,
  setExerciseSplit: (exerciseSplit) => set({ exerciseSplit }),
}));

type ExerciseSplitDaysState = {
  exerciseSplitDays: ExerciseSplitDay[];
  setExerciseSplitDays: (days: ExerciseSplitDay[]) => void;
};

export const useExerciseSplitDaysState = create<ExerciseSplitDaysState>(
  (set) => ({
    exerciseSplitDays: [],
    setExerciseSplitDays: (days) => set({ exerciseSplitDays: days }),
  })
);
