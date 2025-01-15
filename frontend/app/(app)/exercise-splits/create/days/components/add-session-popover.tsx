"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { authClient } from "@/lib/auth-client";
import { PlusIcon } from "lucide-react";
import { FormEvent, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  useExerciseSplitDaySessionsState,
  useExerciseSplitState,
} from "../../use-exercise-split-state";

export function AddSessionPopover({ dayIndex }: { dayIndex: number }) {
  const session = authClient.useSession();
  const exerciseSplit = useExerciseSplitState((state) => state.exerciseSplit);

  const [open, setOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");

  const [exerciseSplitDaySessions, setExerciseSplitDaySessions] =
    useExerciseSplitDaySessionsState(
      useShallow((state) => [
        state.exerciseSplitDaySessions,
        state.setExerciseSplitDaySessions,
      ])
    );

  function addSession(e: FormEvent) {
    e.preventDefault();
    setExerciseSplitDaySessions([
      ...exerciseSplitDaySessions,
      {
        dayIndex,
        exerciseSplitName: exerciseSplit!.name,
        name: newSessionName,
        sessionIndex:
          Math.max(
            ...exerciseSplitDaySessions.map(({ dayIndex }) => dayIndex),
            -1
          ) + 1,
        userId: session.data!.user.id,
      },
    ]);
    setOpen(false);
    setNewSessionName("");
  }

  return (
    <Popover open={open} onOpenChange={(v) => setOpen(v)}>
      <PopoverTrigger asChild>
        <Button size="icon" variant="outline">
          <PlusIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end">
        <form onSubmit={addSession} className="w-full gap-1.5 flex flex-col">
          <Label className="col-span-2" htmlFor="email">
            Session name
          </Label>
          <Input
            id="email"
            required
            placeholder="Type here"
            value={newSessionName}
            onChange={(e) => setNewSessionName(e.target.value)}
          />
          <Button>
            <PlusIcon /> Add session
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
