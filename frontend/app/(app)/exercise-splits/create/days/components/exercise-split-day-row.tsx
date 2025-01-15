"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TableCell, TableRow } from "@/components/ui/table";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ExerciseSplitDay } from "@prisma/client";
import { GripVerticalIcon, TrashIcon, XIcon } from "lucide-react";
import { useExerciseSplitDaySessionsState } from "../../use-exercise-split-state";
import { AddSessionPopover } from "./add-session-popover";
import { useShallow } from "zustand/react/shallow";

type PropsType = {
  splitDay: ExerciseSplitDay;
  deleteDay: (dayIndex: number) => void;
};

export function ExerciseSplitDayRow(props: PropsType) {
  const { splitDay, deleteDay } = props;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    index,
    isDragging,
  } = useSortable({ id: props.splitDay.dayIndex });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={"w-full text-sm h-20"}
    >
      {isDragging ? (
        <TableCell colSpan={3} className="bg-secondary h-20" />
      ) : (
        <>
          <TableCell className="text-right">
            <div className="flex items-center gap-1 w-8">
              <GripVerticalIcon
                className="touch-none"
                size={20}
                {...listeners}
              />
              {index + 1}
            </div>
          </TableCell>
          <TableCell className="w-full">
            <SessionsTableCellBody dayIndex={splitDay.dayIndex} />
          </TableCell>
          <TableCell>
            <div className="flex justify-around gap-2">
              <AddSessionPopover dayIndex={splitDay.dayIndex} />
              <Button
                size="icon"
                variant="destructive"
                onClick={() => deleteDay(splitDay.dayIndex)}
              >
                <TrashIcon />
              </Button>
            </div>
          </TableCell>
        </>
      )}
    </TableRow>
  );
}

function SessionsTableCellBody({ dayIndex }: { dayIndex: number }) {
  const [exerciseSplitDaySessions, setExerciseSplitDaySessions] =
    useExerciseSplitDaySessionsState(
      useShallow((state) => [
        state.exerciseSplitDaySessions,
        state.setExerciseSplitDaySessions,
      ])
    );
  const daySessions = exerciseSplitDaySessions.filter(
    ({ dayIndex: _dayIndex }) => _dayIndex === dayIndex
  );

  function deleteSession(sessionIndex: number, dayIndex: number) {
    setExerciseSplitDaySessions(
      exerciseSplitDaySessions.filter(
        (session) =>
          sessionIndex !== session.sessionIndex || dayIndex !== session.dayIndex
      )
    );
  }

  if (daySessions.length === 0) {
    return (
      <span className="text-muted-foreground font-semibold">Rest day</span>
    );
  }

  return (
    <ScrollArea className="h-full w-full overflow-x-auto">
      <div className="flex gap-1 h-full items-center">
        {daySessions.map((session) => (
          <Badge key={session.sessionIndex} className="gap-1 h-fit">
            <Button
              className="w-4 h-4"
              variant="ghost"
              size="icon"
              onClick={() =>
                deleteSession(session.sessionIndex, session.dayIndex)
              }
            >
              <XIcon />
            </Button>
            {session.name}
          </Badge>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
