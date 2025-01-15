"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import {
  useExerciseSplitDaySessionsState,
  useExerciseSplitDaysState,
  useExerciseSplitState,
} from "../../use-exercise-split-state";
import { ExerciseSplitDayRow } from "./exercise-split-day-row";

export function ExerciseSplitDaysTable() {
  const router = useRouter();
  const session = authClient.useSession();
  const exerciseSplit = useExerciseSplitState((state) => state.exerciseSplit);

  useEffect(() => {
    if (!exerciseSplit) {
      toast.error("You must fill the basics form first");
      router.push("/exercise-splits/create/basics");
    }
  });

  const [exerciseSplitDays, setExerciseSplitDays] = useExerciseSplitDaysState(
    useShallow((state) => [state.exerciseSplitDays, state.setExerciseSplitDays])
  );
  const [exerciseSplitDaySessions, setExerciseSplitDaySessions] =
    useExerciseSplitDaySessionsState(
      useShallow((state) => [
        state.exerciseSplitDaySessions,
        state.setExerciseSplitDaySessions,
      ])
    );

  function addDay() {
    setExerciseSplitDays([
      ...exerciseSplitDays,
      {
        dayIndex:
          Math.max(...exerciseSplitDays.map(({ dayIndex }) => dayIndex), -1) +
          1,
        exerciseSplitName: exerciseSplit!.name,
        userId: session.data!.user.id,
      },
    ]);
  }

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  function deleteDay(dayIndex: number) {
    setExerciseSplitDaySessions(
      exerciseSplitDaySessions.filter(
        (session) => session.dayIndex !== dayIndex
      )
    );
    setExerciseSplitDays(
      exerciseSplitDays.filter((day) => day.dayIndex !== dayIndex)
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = exerciseSplitDays.findIndex(
        (splitDay) => splitDay.dayIndex === active.id
      );
      const newIndex = exerciseSplitDays.findIndex(
        (splitDay) => splitDay.dayIndex === over?.id
      );
      const newExerciseSplitDays = arrayMove(
        exerciseSplitDays,
        oldIndex,
        newIndex
      );
      setExerciseSplitDays(newExerciseSplitDays);
    }
  }

  return (
    <div className="flex flex-col grow gap-2">
      <DndContext
        onDragStart={(event) => setActiveId(event.active.id)}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={exerciseSplitDays.map(({ dayIndex }) => dayIndex)}
          strategy={verticalListSortingStrategy}
        >
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-16"></TableHead>
                <TableHead className="w-full">Sessions</TableHead>
                <TableHead className="text-center w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exerciseSplitDays.map((day) => (
                <ExerciseSplitDayRow
                  key={day.dayIndex}
                  deleteDay={deleteDay}
                  splitDay={day}
                />
              ))}
            </TableBody>
          </Table>
          <Table>
            <DragOverlay
              zIndex={10}
              wrapperElement="tbody"
              className="backdrop-blur-sm [&>tr]:border-y"
            >
              {activeId !== null ? (
                <ExerciseSplitDayRow
                  key={activeId}
                  deleteDay={deleteDay}
                  splitDay={
                    exerciseSplitDays.find(
                      ({ dayIndex }) => dayIndex === activeId
                    )!
                  }
                />
              ) : null}
            </DragOverlay>
          </Table>
        </SortableContext>
      </DndContext>
      <Button
        variant="secondary"
        className="w-fit ml-auto"
        type="button"
        onClick={addDay}
      >
        <PlusIcon /> Add day
      </Button>
    </div>
  );
}
