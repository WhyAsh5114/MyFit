import { TypographyH1 } from "@/components/typography/h1";
import { TypographyH2 } from "@/components/typography/h2";
import { ExerciseSplitBasicsForm } from "./exercise-split-basics-form";

export default function ExerciseSplitsCreateBasicsPage() {
  return (
    <>
      <TypographyH1>Create split</TypographyH1>
      <TypographyH2>Basics</TypographyH2>
      <ExerciseSplitBasicsForm />
    </>
  );
}
