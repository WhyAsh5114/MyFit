"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PlusIcon,
  Search
} from "lucide-react";
import Link from "next/link";

export function ExerciseSplitsSearch() {
  return (
    <div className="flex gap-1">
      <div className="relative w-full">
        <Input
          id="search-exercise-splits"
          className="peer pe-9 ps-9"
          placeholder="Search..."
          type="search"
        />
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
          <Search size={16} strokeWidth={2} />
        </div>
      </div>
      <Button
        size="icon"
        className="shrink-0"
        aria-label="create-exercise-split"
      >
        <Link href="/exercise-splits/create">
          <PlusIcon />
        </Link>
      </Button>
    </div>
  );
}
