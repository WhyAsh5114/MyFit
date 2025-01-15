import {
  ExerciseSplit,
  ExerciseSplitDay,
  ExerciseSplitDaySession,
} from "@prisma/client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ExerciseSplitState = {
  exerciseSplit: ExerciseSplit | null;
  setExerciseSplit: (exerciseSplit: ExerciseSplit) => void;
};

export const useExerciseSplitState = create<ExerciseSplitState>()(
  persist(
    (set) => ({
      exerciseSplit: null,
      setExerciseSplit: (exerciseSplit) => set({ exerciseSplit }),
    }),
    {
      name: "exercise-split",
    }
  )
);

type ExerciseSplitDaysState = {
  exerciseSplitDays: ExerciseSplitDay[];
  setExerciseSplitDays: (exerciseSplitDays: ExerciseSplitDay[]) => void;
};

export const useExerciseSplitDaysState = create<ExerciseSplitDaysState>()(
  persist(
    (set) => ({
      exerciseSplitDays: [],
      setExerciseSplitDays: (exerciseSplitDays) => set({ exerciseSplitDays }),
    }),
    {
      name: "exercise-split-days",
    }
  )
);

type ExerciseSplitDaySessionsState = {
  exerciseSplitDaySessions: ExerciseSplitDaySession[];
  setExerciseSplitDaySessions: (
    exerciseSplitDaySessions: ExerciseSplitDaySession[]
  ) => void;
};

export const useExerciseSplitDaySessionsState =
  create<ExerciseSplitDaySessionsState>()(
    persist(
      (set) => ({
        exerciseSplitDaySessions: [],
        setExerciseSplitDaySessions: (exerciseSplitDaySessions) =>
          set({ exerciseSplitDaySessions }),
      }),
      {
        name: "exercise-split-day-sessions",
      }
    )
  );
