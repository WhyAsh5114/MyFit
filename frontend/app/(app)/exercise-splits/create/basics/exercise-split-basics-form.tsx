"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { ChevronRight, PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { useExerciseSplitState } from "../use-exercise-split-state";

export function ExerciseSplitBasicsForm() {
  const session = authClient.useSession();

  const [exerciseSplit, setExerciseSplit] = useExerciseSplitState(
    useShallow((state) => [state.exerciseSplit, state.setExerciseSplit])
  );

  const [exerciseSplitName, setExerciseSplitName] = useState(
    exerciseSplit?.name ?? ""
  );
  const [exerciseSplitDescription, setExerciseSplitDescription] = useState(
    exerciseSplit?.description ?? ""
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session.data?.user.id) {
      toast.error("You must be logged in to create an exercise split");
      return;
    }

    setExerciseSplit({
      name: exerciseSplitName,
      userId: session.data.user.id,
      description: exerciseSplitDescription,
    });
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
      <div className="grid w-full gap-1.5">
        <Label htmlFor="exercise-split-description">Description</Label>
        <Textarea
          placeholder="Type here"
          id="exercise-split-description"
          value={exerciseSplitDescription}
          onChange={(e) => setExerciseSplitDescription(e.target.value)}
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
