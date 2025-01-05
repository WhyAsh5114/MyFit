import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="grid gap-4 place-items-center">
      <h2>TODO: Landing page</h2>
      <Button asChild>
        <Link href="/dashboard">Open app</Link>
      </Button>
    </main>
  );
}
