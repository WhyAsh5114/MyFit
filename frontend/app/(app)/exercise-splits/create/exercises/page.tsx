import { TypographyH1 } from "@/components/typography/h1";
import { TypographyH2 } from "@/components/typography/h2";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function ExerciseSplitsCreateExercisesPage() {
  return (
    <>
      <TypographyH1>Create split</TypographyH1>
      <TypographyH2>Exercises</TypographyH2>
      <div className="grid gap-1 grid-cols-2">
        <Button variant="secondary" asChild>
          <Link href="/exercise-splits/create/days">
            <ChevronLeft /> Prev
          </Link>
        </Button>
        <Button asChild>
          <Link href="/exercise-splits/create/overview">
            Next <ChevronRight />
          </Link>
        </Button>
      </div>
    </>
  );
}
