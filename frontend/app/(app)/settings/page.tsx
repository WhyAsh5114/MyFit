import { TypographyH1 } from "@/components/typography/h1";
import { CheckForUpdates } from "./check-for-updates";

export default function SettingsPage() {
  return (
    <>
      <TypographyH1>Settings</TypographyH1>
      <CheckForUpdates />
    </>
  );
}
