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
