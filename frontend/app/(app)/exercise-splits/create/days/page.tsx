import { TypographyH1 } from "@/components/typography/h1";
import { TypographyH2 } from "@/components/typography/h2";
import { ExerciseSplitDaysTable } from "./components/exercise-split-days-table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

export default function ExerciseSplitsCreateDaysPage() {
  return (
    <>
      <TypographyH1>Create split</TypographyH1>
      <TypographyH2>Days</TypographyH2>
      <ScrollArea className="h-px grow">
        <ExerciseSplitDaysTable />
      </ScrollArea>
      <div className="grid gap-1 grid-cols-2">
        <Button variant="secondary" asChild>
          <Link href="/exercise-splits/create/basics">
            <ChevronLeft /> Prev
          </Link>
        </Button>
        <Button asChild>
          <Link href="/exercise-splits/create/exercises">
            Next <ChevronRight />
          </Link>
        </Button>
      </div>
    </>
  );
}
