"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

type Item = { label: string; href?: string };

function pathnameToItems(pathname: string): Item[] {
  const parts = pathname.split("/").filter((part) => part !== "");
  const items = [
    { label: "Home", href: "/" },
    ...parts.map((part, index) => {
      if (index === parts.length - 1) {
        part = part.split("?")[0];
      }
      return {
        label: part
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        href: `/${parts.slice(0, index + 1).join("/")}`,
      };
    }),
  ];
  return items;
}

export function LinkBreadcrumbs() {
  const pathname = usePathname();
  const items = pathnameToItems(pathname);

  return (
    <ScrollArea>
      <Breadcrumb>
        <BreadcrumbList className="flex-nowrap py-2.5">
          {items.map((item, index) => (
            <Fragment key={index}>
              <BreadcrumbItem>
                <BreadcrumbLink href={item.href} className="whitespace-nowrap">
                  {item.label}
                </BreadcrumbLink>
              </BreadcrumbItem>
              {index < items.length - 1 && <BreadcrumbSeparator />}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
