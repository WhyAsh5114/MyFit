import { Suspense } from "react";
import { DataComponent } from "./DataComponent";

export default function Page() {
  return (
    <Suspense>
      <DataComponent />
    </Suspense>
  );
}
