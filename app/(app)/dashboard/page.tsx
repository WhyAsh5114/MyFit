import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  const currentDate = new Date().toLocaleString(undefined, {
    timeStyle: "medium",
    dateStyle: "medium",
    timeZone: "UTC",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          MyFit <span className="text-primary">v4</span>
        </CardTitle>
        <CardDescription>
          Preview deployment at:{" "}
          <span className="font-semibold">{currentDate} UTC</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          If you are a user stumbling across this link, damn you are curious and
          just can&apos;t wait huh
        </p>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-destructive">
          Not ready for use AT ALL! And not releasing anytime soon...
        </p>
      </CardFooter>
    </Card>
  );
}
