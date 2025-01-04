"use client";

import Link from "next/link";
import { useSidebar } from "../ui/sidebar";

export function HomeButton() {
  const { setOpenMobile } = useSidebar();

  return (
    <h1 className="text-xl font-semibold w-full p-2">
      <Link href="/" onClick={() => setOpenMobile(false)}>
        MyFit
      </Link>
    </h1>
  );
}
