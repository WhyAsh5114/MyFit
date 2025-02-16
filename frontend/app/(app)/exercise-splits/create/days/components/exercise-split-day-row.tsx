"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TableCell, TableRow } from "@/components/ui/table";
import { closestCenter, DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ExerciseSplitDay, ExerciseSplitDaySession } from "@prisma/client";
import { GripVerticalIcon, TrashIcon, XIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useExerciseSplitDaySessionsState } from "../../use-exercise-split-state";
import { AddSessionPopover } from "./add-session-popover";

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
  const daySessions = (() =>
    exerciseSplitDaySessions.filter(
      ({ dayIndex: _dayIndex }) => _dayIndex === dayIndex
    ))();

  function deleteSession(sessionIndex: number, dayIndex: number) {
    setExerciseSplitDaySessions(
      exerciseSplitDaySessions.filter(
        (session) =>
          sessionIndex !== session.sessionIndex || dayIndex !== session.dayIndex
      )
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    console.log(active.id, over?.id);

    if (active.id !== over?.id) {
      const oldIndex = daySessions.findIndex(
        ({ sessionIndex, dayIndex }) =>
          active.id === `${dayIndex}>${sessionIndex}`
      );
      const newIndex = daySessions.findIndex(
        ({ sessionIndex, dayIndex }) =>
          over?.id === `${dayIndex}>${sessionIndex}`
      );

      const newItems = arrayMove(daySessions, oldIndex, newIndex);
      setExerciseSplitDaySessions(newItems);
    }
  }

  return (
    <ScrollArea className="h-full w-full overflow-x-auto">
      <div className="flex gap-1 h-full items-center">
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={daySessions.map(
              ({ sessionIndex, dayIndex }) => `${dayIndex}>${sessionIndex}`
            )}
            strategy={verticalListSortingStrategy}
          >
            {daySessions.length ? (
              daySessions.map((session) => (
                <SessionBadge
                  key={session.sessionIndex}
                  session={session}
                  deleteSession={deleteSession}
                />
              ))
            ) : (
              <span className="text-muted-foreground font-semibold">
                Rest day
              </span>
            )}
          </SortableContext>
        </DndContext>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

function SessionBadge({
  session,
  deleteSession,
}: {
  session: ExerciseSplitDaySession;
  deleteSession: (sessionIndex: number, dayIndex: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: `${session.dayIndex}>${session.sessionIndex}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Badge className="gap-1 h-fit">
        <Button
          className="w-4 h-4"
          variant="ghost"
          size="icon"
          onClick={() => deleteSession(session.sessionIndex, session.dayIndex)}
        >
          <XIcon />
        </Button>
        {session.name}
      </Badge>
    </div>
  );
}
