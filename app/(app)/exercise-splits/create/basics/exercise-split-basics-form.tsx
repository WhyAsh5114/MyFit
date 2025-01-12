"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, PlusIcon } from "lucide-react";
import { useExerciseSplitState } from "../use-exercise-split-state";
import { useShallow } from "zustand/react/shallow";
import { useState } from "react";

export function ExerciseSplitBasicsForm() {
  const [exerciseSplit] = useExerciseSplitState(
    useShallow((state) => [state.exerciseSplit, state.setExerciseSplit])
  );

  const [exerciseSplitName, setExerciseSplitName] = useState(
    exerciseSplit?.name
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function addDay() {}

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 grow">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="exercise-split-name">Exercise split name</Label>
        <Input
          id="exercise-split-name"
          placeholder="Type here"
          required
          value={exerciseSplitName}
          onChange={(e) => setExerciseSplitName(e.target.value)}
        />
      </div>
      <div className="flex flex-col grow">
        <Button
          variant="secondary"
          className="w-fit ml-auto"
          type="button"
          onClick={addDay}
        >
          <PlusIcon /> Add day
        </Button>
      </div>
      <Button type="submit">
        Next <ChevronRight />
      </Button>
    </form>
  );
}
