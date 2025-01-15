"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useExerciseSplitState } from "../use-exercise-split-state";
import { useRouter } from "next/navigation";

export function ExerciseSplitBasicsForm() {
  const router = useRouter();
  const session = authClient.useSession();

  const [exerciseSplit, setExerciseSplit] = useExerciseSplitState(
    useShallow((state) => [state.exerciseSplit, state.setExerciseSplit])
  );

  const [exerciseSplitName, setExerciseSplitName] = useState("");
  const [exerciseSplitDescription, setExerciseSplitDescription] = useState("");

  useEffect(() => {
    if (exerciseSplit) {
      setExerciseSplitName(exerciseSplit.name);
      setExerciseSplitDescription(exerciseSplit.description || "");
    }
  }, [exerciseSplit]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setExerciseSplit({
      name: exerciseSplitName,
      userId: session.data!.user.id,
      description: exerciseSplitDescription,
    });
    router.push("/exercise-splits/create/days");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 grow">
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
      <Button type="submit" className="mt-auto">
        Next <ChevronRight />
      </Button>
    </form>
  );
}
