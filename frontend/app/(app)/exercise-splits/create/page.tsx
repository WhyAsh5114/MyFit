import { TypographyH1 } from "@/components/typography/h1";
import { TypographyH2 } from "@/components/typography/h2";
import { Button } from "@/components/ui/button";
import { ChevronRightCircleIcon } from "lucide-react";
import Link from "next/link";

export default function ExerciseSplitsCreatePage() {
  return (
    <>
      <TypographyH1>Create split</TypographyH1>
      <TypographyH2>Choose template</TypographyH2>
      <div className="flex flex-col grow"></div>
      <Button asChild>
        <Link href="/exercise-splits/create/basics">
          Start from scratch
          <ChevronRightCircleIcon />
        </Link>
      </Button>
    </>
  );
}
