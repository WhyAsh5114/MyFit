import { muscleGroups, setTypes } from "$lib/types/arrays";
import { z } from "zod";

export const structureTabFormSchema = z.object({
  exerciseSplitName: z.string().min(1),
  exerciseSplitDayName: z.string(),
  exerciseSplitDays: z
    .array(z.string().nullable())
    .refine((arr) => arr.some((item) => typeof item === "string"), {
      message: "Add at least one workout"
    })
    .refine(
      (arr) => {
        const filteredArray = arr.filter((item) => item !== null);
        const stringSet = new Set(filteredArray);
        return stringSet.size === filteredArray.length;
      },
      {
        message: "Workout names should be unique"
      }
    )
});

export const exerciseTemplateFormSchema = z
  .object({
    exerciseName: z.string().min(2),
    sets: z.coerce.number().int().min(1),
    targetMuscleGroup: z.enum(muscleGroups),
    setType: z.enum(setTypes),
    repRangeStart: z.coerce.number().int().min(1),
    repRangeEnd: z.coerce.number().int(),
    involvesBodyweight: z.boolean(),
    note: z.string().optional()
  })
  .refine((data) => data.repRangeStart < data.repRangeEnd, {
    message: "Rep range end must be higher than rep range start",
    path: ["repRangeEnd"]
  });
