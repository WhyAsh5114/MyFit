import { TypographyH1 } from "@/components/typography/h1";
import { ExerciseSplitsList } from "./exercise-splits-list";
import { ExerciseSplitsSearch } from "./exercise-splits-search";

export default function ExerciseSplitsPage() {
  return (
    <>
      <TypographyH1>Exercise splits</TypographyH1>
      <ExerciseSplitsSearch />
      <ExerciseSplitsList />
    </>
  );
}
