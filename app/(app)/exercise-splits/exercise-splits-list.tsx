"use client";

import { usePidbClient } from "@/hooks/use-pidb";
import { ExerciseSplit } from "@prisma/client";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";

export function ExerciseSplitsList() {
  const client = usePidbClient((state) => state.client);
  const [exerciseSplits, setExerciseSplits] = useState<ExerciseSplit[]>([]);

  useEffect(() => {
    client?.exerciseSplit.findMany().then((v) => setExerciseSplits(v));
  });

  if (exerciseSplits.length === 0) {
    return (
      <div className="flex flex-col gap-4 mx-auto items-center justify-center grow text-muted-foreground">
        <CalendarIcon size={128} strokeWidth={1} />
        <p>No exercise splits found</p>
      </div>
    );
  }

  return <></>;
}
